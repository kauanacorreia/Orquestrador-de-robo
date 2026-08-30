Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  post "/login", to: "sessions#create"

  namespace :api do
    get "health", to: "health#show"

    resources :robots, only: [:index, :show, :create] do
      member do
        post :new_version
        get :versions
      end
    end

    get "dashboard/summary", to: "dashboard#summary"
    get "dashboard/volumetria", to: "dashboard#volumetria"
    get "dashboard/filter_options", to: "dashboard#filter_options"

    namespace :v1 do
      resources :companies, only: [:index] do
        get "robots/:robot_id",
            to: "company_robot_configs#show"

        put "robots/:robot_id",
            to: "company_robot_configs#update"
      end
    end
  end
end