module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_supabase_user!
      before_action :require_admin!, except: [:record_login]

      def index
        profiles =
          Profile.order(:name)

        render json:
          profiles.map do |profile|
            profile_json(profile)
          end
      end

      def create
        name =
          params[:name]
            .to_s
            .strip

        email =
          params[:email]
            .to_s
            .strip
            .downcase

        password =
          params[:password]
            .to_s

        role =
          params[:role]
            .to_s
            .upcase

        if name.blank?
          return render json: {
            errors: [
              "Nome é obrigatório"
            ]
          }, status: :unprocessable_entity
        end

        if email.blank?
          return render json: {
            errors: [
              "E-mail é obrigatório"
            ]
          }, status: :unprocessable_entity
        end

        if password.blank?
          return render json: {
            errors: [
              "Senha é obrigatória"
            ]
          }, status: :unprocessable_entity
        end

        if password.length < 6
          return render json: {
            errors: [
              "A senha deve possuir pelo menos 6 caracteres"
            ]
          }, status: :unprocessable_entity
        end

        unless Profile::ACCESS_LEVELS.include?(role)
          return render json: {
            errors: [
              "Nível de acesso inválido"
            ]
          }, status: :unprocessable_entity
        end

        if Profile
             .where(
               "LOWER(email) = ?",
               email
             )
             .exists?

          return render json: {
            errors: [
              "Já existe um usuário com este e-mail"
            ]
          }, status: :unprocessable_entity
        end

        response =
          create_supabase_user(
            email: email,
            password: password,
            name: name
          )

        unless response.success?
          data =
            parse_json_response(
              response.body
            )

          message =
            data["msg"] ||
            data["message"] ||
            data["error_description"] ||
            data["error"] ||
            "Não foi possível criar o usuário"

          Rails.logger.error(
            "Erro Supabase ao criar usuário: status=#{response.status} body=#{response.body}"
          )

          return render json: {
            errors: [
              message
            ]
          }, status: :unprocessable_entity
        end

        user_data =
          parse_json_response(
            response.body
          )

        user_id =
          user_data["id"] ||
          user_data.dig(
            "user",
            "id"
          )

        if user_id.blank?
          return render json: {
            errors: [
              "Supabase não retornou o identificador do usuário"
            ]
          }, status: :unprocessable_entity
        end

        profile =
          Profile.find_or_initialize_by(
            id: user_id
          )

        profile.name =
          name

        profile.email =
          email

        profile.role =
          role

        profile.status =
          "ACTIVE"

        profile.save!

        render json:
          profile_json(profile),
          status: :created

      rescue ActiveRecord::RecordInvalid => error
        Rails.logger.error(
          "Erro ao salvar perfil: #{error.message}"
        )

        render json: {
          errors:
            error.record.errors.full_messages
        }, status: :unprocessable_entity

      rescue StandardError => error
        Rails.logger.error(
          "Erro ao criar usuário: #{error.class} - #{error.message}"
        )

        Rails.logger.error(
          error.backtrace.first(10).join("\n")
        )

        render json: {
          errors: [
            "Não foi possível criar o usuário"
          ]
        }, status: :unprocessable_entity
      end

      def permissions
        profile =
          Profile.find(
            params[:id]
          )

        role =
          params[:role]
            .to_s
            .upcase

        unless Profile::ACCESS_LEVELS.include?(role)
          return render json: {
            errors: [
              "Nível de acesso inválido"
            ]
          }, status: :unprocessable_entity
        end

        if (
          profile.admin? &&
          profile.active? &&
          role != "ADMIN" &&
          active_admin_count <= 1
        )
          return render json: {
            errors: [
              "É necessário manter pelo menos um administrador ativo"
            ]
          }, status: :unprocessable_entity
        end

        profile.update!(
          role: role
        )

        render json:
          profile_json(profile)

      rescue ActiveRecord::RecordNotFound
        render json: {
          errors: [
            "Usuário não encontrado"
          ]
        }, status: :not_found

      rescue ActiveRecord::RecordInvalid => error
        render json: {
          errors:
            error.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      def toggle_status
        profile =
          Profile.find(
            params[:id]
          )

        new_status =
          profile.active? ?
            "INACTIVE" :
            "ACTIVE"

        if (
          profile.id ==
          current_profile.id &&
          new_status == "INACTIVE"
        )
          return render json: {
            errors: [
              "Você não pode desativar o seu próprio usuário"
            ]
          }, status: :unprocessable_entity
        end

        if (
          profile.admin? &&
          profile.active? &&
          new_status == "INACTIVE" &&
          active_admin_count <= 1
        )
          return render json: {
            errors: [
              "É necessário manter pelo menos um administrador ativo"
            ]
          }, status: :unprocessable_entity
        end

        response =
          update_supabase_access(
            profile.id,
            new_status
          )

        unless response.success?
          data =
            parse_json_response(
              response.body
            )

          message =
            data["msg"] ||
            data["message"] ||
            data["error_description"] ||
            data["error"] ||
            "Não foi possível alterar o status do usuário"

          Rails.logger.error(
            "Erro Supabase ao alterar status do usuário #{profile.id}: status=#{response.status} body=#{response.body}"
          )

          return render json: {
            errors: [
              message
            ]
          }, status: :unprocessable_entity
        end

        profile.update!(
          status: new_status
        )

        render json:
          profile_json(profile)

      rescue ActiveRecord::RecordNotFound
        render json: {
          errors: [
            "Usuário não encontrado"
          ]
        }, status: :not_found

      rescue ActiveRecord::RecordInvalid => error
        render json: {
          errors:
            error.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      def record_login
        current_profile.update_column(
          :last_login_at,
          Time.current
        )

        render json: {
          success: true,
          last_login_at:
            current_profile
              .reload
              .last_login_at
        }
      end

      private

      def active_admin_count
        Profile.where(
          role: "ADMIN",
          status: "ACTIVE"
        ).count
      end

      def create_supabase_user(
        email:,
        password:,
        name:
      )
        service_role_key =
          supabase_admin_key

        connection =
          Faraday.new(
            url:
              ENV["SUPABASE_URL"]
          )

        connection.post(
          "/auth/v1/admin/users"
        ) do |request|
          add_supabase_admin_headers(
            request,
            service_role_key
          )

          request.body = {
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
              name: name
            }
          }.to_json
        end
      end

      def update_supabase_access(
        user_id,
        status
      )
        service_role_key =
          supabase_admin_key

        connection =
          Faraday.new(
            url:
              ENV["SUPABASE_URL"]
          )

        ban_duration =
          status == "INACTIVE" ?
            "876000h" :
            "none"

        connection.put(
          "/auth/v1/admin/users/#{user_id}"
        ) do |request|
          add_supabase_admin_headers(
            request,
            service_role_key
          )

          request.body = {
            ban_duration:
              ban_duration
          }.to_json
        end
      end

      def supabase_admin_key
        key =
          ENV[
            "SUPABASE_SERVICE_ROLE_KEY"
          ]

        if key.blank?
          raise(
            "SUPABASE_SERVICE_ROLE_KEY não configurada"
          )
        end

        key
      end

      def add_supabase_admin_headers(
        request,
        key
      )
        request.headers["apikey"] =
          key

        request.headers["Authorization"] =
          "Bearer #{key}"

        request.headers["Content-Type"] =
          "application/json"
      end

      def parse_json_response(body)
        JSON.parse(body)
      rescue JSON::ParserError
        {}
      end

      def profile_json(profile)
        {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          status: profile.status,
          last_login_at:
            profile.last_login_at,
          created_at:
            profile.created_at
        }
      end
    end
  end
end