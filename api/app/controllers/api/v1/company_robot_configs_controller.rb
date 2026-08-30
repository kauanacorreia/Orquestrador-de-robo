module Api
  module V1
    class CompanyRobotConfigsController < ApplicationController
      before_action :set_company
      before_action :set_robot

      def show
        config = CompanyRobotConfig.find_by(
          company_id: @company.id,
          robot_id: @robot.id
        )

        render json: {
          company: {
            id: @company.id,
            name: @company.name
          },
          robot: {
            id: @robot.id,
            name: @robot.name,
            schema: @robot.schema
          },
          parameters: config&.parameters || {}
        }
      end

      def update
        parameters = params
          .require(:parameters)
          .permit!
          .to_h

        fields = Array(@robot.schema&.fetch("fields", []))

        field_names = fields
          .map { |field| field["name"] }
          .compact

        unknown_fields = parameters.keys - field_names

        if unknown_fields.any?
          return render json: {
            error: "Parâmetros desconhecidos",
            fields: unknown_fields
          }, status: :unprocessable_entity
        end

        missing_fields = fields
          .select { |field| field["required"] }
          .select do |field|
            blank_parameter?(parameters[field["name"]])
          end
          .map { |field| field["name"] }

        if missing_fields.any?
          return render json: {
            error: "Parâmetros obrigatórios não informados",
            fields: missing_fields
          }, status: :unprocessable_entity
        end

        config = CompanyRobotConfig.find_or_initialize_by(
          company_id: @company.id,
          robot_id: @robot.id
        )

        config.parameters = parameters
        config.save!

        render json: {
          id: config.id,
          company_id: config.company_id,
          robot_id: config.robot_id,
          parameters: config.parameters,
          updated_at: config.updated_at
        }
      end

      private

      def set_company
        @company = Company.find(params[:company_id])
      end

      def set_robot
        @robot = Robot.find(params[:robot_id])
      end

      def blank_parameter?(value)
        value.nil? ||
          (value.respond_to?(:empty?) && value.empty?)
      end
    end
  end
end