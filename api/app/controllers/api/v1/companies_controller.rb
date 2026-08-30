module Api
  module V1
    class CompaniesController < ApplicationController
      def index
        companies = Company.order(:name)

        render json: companies.map { |company|
          {
            id: company.id,
            name: company.name,
            status: company.status
          }
        }
      end
    end
  end
end