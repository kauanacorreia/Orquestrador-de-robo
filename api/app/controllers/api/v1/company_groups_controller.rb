module Api
  module V1
    class CompanyGroupsController < ApplicationController
      def index
        groups =
          CompanyGroup
            .includes(:companies)
            .order(:name)

        render json: groups.map {
          |group| company_group_json(group)
        }
      end

      def show
        group =
          CompanyGroup
            .includes(:companies)
            .find(params[:id])

        render json:
          company_group_json(
            group,
            include_company_ids: true
          )
      end

      def create
        attributes =
          company_group_params.to_h

        company_ids =
          normalize_company_ids(
            attributes.delete("company_ids")
          )

        invalid_company_ids =
          invalid_company_ids(company_ids)

        if invalid_company_ids.any?
          render json: {
            errors: [
              "Uma ou mais empresas selecionadas não foram encontradas."
            ]
          }, status: :unprocessable_entity

          return
        end

        group =
          CompanyGroup.new(
            name: attributes["name"]
          )

        CompanyGroup.transaction do
          group.save!

          group.company_ids =
            company_ids
        end

        group.reload

        render json:
          company_group_json(
            group,
            include_company_ids: true
          ),
          status: :created

      rescue ActiveRecord::RecordInvalid
        render json: {
          errors: group.errors.full_messages
        }, status: :unprocessable_entity
      end

      def update
        group =
          CompanyGroup.find(
            params[:id]
          )

        attributes =
          company_group_params.to_h

        company_ids_provided =
          attributes.key?(
            "company_ids"
          )

        company_ids =
          if company_ids_provided
            normalize_company_ids(
              attributes.delete(
                "company_ids"
              )
            )
          else
            []
          end

        if company_ids_provided
          invalid_ids =
            invalid_company_ids(
              company_ids
            )

          if invalid_ids.any?
            render json: {
              errors: [
                "Uma ou mais empresas selecionadas não foram encontradas."
              ]
            }, status: :unprocessable_entity

            return
          end
        end

        CompanyGroup.transaction do
          if attributes.key?("name")
            group.update!(
              name: attributes["name"]
            )
          end

          if company_ids_provided
            group.company_ids =
              company_ids
          end
        end

        group.reload

        render json:
          company_group_json(
            group,
            include_company_ids: true
          )

      rescue ActiveRecord::RecordInvalid
        render json: {
          errors: group.errors.full_messages
        }, status: :unprocessable_entity
      end

      private

      def company_group_params
        params.permit(
          :name,
          company_ids: []
        )
      end

      def normalize_company_ids(
        company_ids
      )
        Array(company_ids)
          .map(&:to_s)
          .map(&:strip)
          .reject(&:blank?)
          .uniq
      end

      def invalid_company_ids(
        company_ids
      )
        return [] if company_ids.empty?

        existing_ids =
          Company
            .where(id: company_ids)
            .pluck(:id)
            .map(&:to_s)

        company_ids -
          existing_ids
      end

      def company_group_json(
        group,
        include_company_ids: false
      )
        json = {
          id: group.id,
          name: group.name,

          companies_count:
            group.companies.size,

          created_at:
            group.created_at,

          updated_at:
            group.updated_at
        }

        if include_company_ids
          json[:company_ids] =
            group
              .companies
              .map(&:id)
        end

        json
      end
    end
  end
end