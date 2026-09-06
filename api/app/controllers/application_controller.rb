class ApplicationController < ActionController::API
  def current_user_id
    params[:user_id]
  end
end