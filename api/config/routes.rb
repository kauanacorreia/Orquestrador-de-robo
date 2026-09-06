Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  post "/login", to: "sessions#create"

  namespace :api do
    get "health", to: "health#show"

    resources :robots, only: [:index, :show, :create, :update] do
      member do
        post :new_version
        get :versions
        patch :toggle_status
        get :edit_logs
      end
    end

    get "dashboard/summary", to: "dashboard#summary"
    get "dashboard/volumetria", to: "dashboard#volumetria"
    get "dashboard/filter_options", to: "dashboard#filter_options"
  end
end