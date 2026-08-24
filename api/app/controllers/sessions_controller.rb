class SessionsController < ApplicationController
  def create
    response = Faraday.post(
      "#{ENV['SUPABASE_URL']}/auth/v1/token?grant_type=password",
      { email: params[:email], password: params[:password] }.to_json,
      { 'apikey' => ENV['SUPABASE_ANON_KEY'], 'Content-Type' => 'application/json' }
    )

    unless response.success?
      return render json: { error: 'Credenciais inválidas' }, status: :unauthorized
    end

    data = JSON.parse(response.body)
    user_id = data['user']['id']

    profile = Profile.find_by(id: user_id)

    render json: {
      token: data['access_token'],
      user: {
        id: user_id,
        email: data['user']['email'],
        name: profile&.name,
        role: profile&.role
      }
    }
  end
end