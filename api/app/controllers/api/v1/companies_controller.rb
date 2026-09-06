module Api
  module V1
    class CompaniesController < ApplicationController
      def index
        companies = Company.order(:name)

        render json: companies.map { |company| company_json(company) }
      end

      def show
        company = Company.find(params[:id])

        render json: company_json(company)
      end

      def create
        company = Company.new(company_params)
        company.status = "ACTIVE"

        if company.save
          render json: company_json(company), status: :created
        else
          render json: {
            errors: company.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def update
        company = Company.find(params[:id])

        attributes = company_params.to_h

        # Campo vazio significa "manter a credencial atual".
        if attributes["access_password"].blank?
          attributes.delete("access_password")
        end

        if attributes["secret_phrase"].blank?
          attributes.delete("secret_phrase")
        end

        if company.update(attributes)
          render json: company_json(company)
        else
          render json: {
            errors: company.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def toggle_status
        company = Company.find(params[:id])

        new_status =
          company.status == "ACTIVE" ? "INACTIVE" : "ACTIVE"

        company.update!(status: new_status)

        render json: company_json(company)
      end

      private

      def company_params
        params.permit(
          :code,
          :name,
          :company_folder,
          :cnpj,
          :state_registration,
          :tax_regime,
          :simple_national_opt_in,
          :pis_pasep,
          :monetary_variation,
          :account_number,
          :notification_email,
          :access_password,
          :secret_phrase
        )
      end

      def company_json(company)
        {
          id: company.id,
          code: company.code,
          name: company.name,
          company_folder: company.company_folder,
          cnpj: company.cnpj,
          state_registration: company.state_registration,
          tax_regime: company.tax_regime,
          simple_national_opt_in: company.simple_national_opt_in,
          pis_pasep: company.pis_pasep,
          monetary_variation: company.monetary_variation,
          account_number: company.account_number,
          notification_email: company.notification_email,
          status: company.status,

          # Nunca devolvemos as credenciais reais para o Angular.
          access_password_configured: company.access_password.present?,
          secret_phrase_configured: company.secret_phrase.present?,

          created_at: company.created_at,
          updated_at: company.updated_at
        }
      end
    end
  end
end