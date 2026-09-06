class ApplicationController < ActionController::API
  def current_user_id
    params[:user_id]
  end

  private

  def authenticate_supabase_user!
    token = bearer_token

    if token.blank?
      render json: {
        error: "Usuário não autenticado"
      }, status: :unauthorized

      return
    end

    response = Faraday.get(
      "#{ENV['SUPABASE_URL']}/auth/v1/user"
    ) do |request|
      request.headers["apikey"] =
        ENV["SUPABASE_ANON_KEY"]

      request.headers["Authorization"] =
        "Bearer #{token}"
    end

    unless response.success?
      render json: {
        error: "Sessão inválida ou expirada"
      }, status: :unauthorized

      return
    end

    @supabase_user =
      JSON.parse(response.body)

    synchronize_current_profile!

  rescue StandardError => error
    Rails.logger.error(
      "Erro ao autenticar usuário Supabase: #{error.message}"
    )

    render json: {
      error: "Não foi possível validar a sessão"
    }, status: :unauthorized
  end

  def require_admin!
    return if performed?

    unless current_profile&.admin?
      render json: {
        error: "Acesso permitido apenas para administradores"
      }, status: :forbidden
    end
  end

  def current_profile
    @current_profile
  end

  def current_supabase_user
    @supabase_user
  end

  def bearer_token
    authorization =
      request.headers["Authorization"].to_s

    return nil unless authorization.start_with?("Bearer ")

    authorization
      .delete_prefix("Bearer ")
      .strip
  end

  def synchronize_current_profile!
    user_id =
      current_supabase_user["id"]

    email =
      current_supabase_user["email"]

    metadata =
      current_supabase_user["user_metadata"] || {}

    @current_profile =
      Profile.find_or_initialize_by(
        id: user_id
      )

    if current_profile.new_record?
      current_profile.name =
        metadata["name"].presence ||
        metadata["full_name"].presence ||
        email.to_s.split("@").first

      current_profile.role =
        "OPERATOR"
    end

    if email.present?
      current_profile.email =
        email
    end

    current_profile.save!
  end
end