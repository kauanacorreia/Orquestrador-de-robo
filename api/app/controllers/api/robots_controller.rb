module Api
  class RobotsController < ApplicationController

    def index
      robots = Robot.order(:name)
      render json: robots
    end

    def show
      robot = Robot.find(params[:id])
      render json: robot
    end

    def create
      robot = Robot.new(
        name: params[:name],
        description: params[:description],
        department: params[:department],
        schema: params[:schema],
        status: "ACTIVE",
        current_version: 1
      )

      if robot.save
        RobotVersion.create!(
          robot_id: robot.id,
          version: 1,
          schema: robot.schema
        )
        render json: robot, status: :created
      else
        render json: { errors: robot.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      robot = Robot.find(params[:id])
      old_fields = indexed_fields(robot.schema)
      new_schema = params[:schema] || robot.schema
      new_fields = indexed_fields(new_schema)

      ActiveRecord::Base.transaction do
        log_field_changes(robot, old_fields, new_fields)
        log_simple_change(robot, "name", robot.name, params[:name]) if params[:name].present?
        log_simple_change(robot, "description", robot.description, params[:description]) if params[:description].present?
        log_simple_change(robot, "department", robot.department, params[:department]) if params[:department].present?

        robot.update!(
          name: params[:name] || robot.name,
          description: params[:description] || robot.description,
          department: params[:department] || robot.department,
          schema: new_schema
        )
      end

      render json: robot
    end

    def toggle_status
      robot = Robot.find(params[:id])
      old_status = robot.status
      new_status = old_status == "ACTIVE" ? "INACTIVE" : "ACTIVE"

      robot.update!(status: new_status)

      RobotEditLog.create!(
        robot_id: robot.id,
        user_id: current_user_id,
        field_name: "status",
        old_value: old_status,
        new_value: new_status
      )

      render json: robot
    end

    def new_version
      robot = Robot.find(params[:id])
      next_version = robot.current_version + 1

      RobotVersion.create!(
        robot_id: robot.id,
        version: next_version,
        schema: params[:schema]
      )

      robot.update!(
        schema: params[:schema],
        current_version: next_version
      )

      render json: robot
    end

    def versions
      robot = Robot.find(params[:id])
      render json: robot.robot_versions.order(:version)
    end

    def edit_logs
      robot = Robot.find(params[:id])
      render json: robot.robot_edit_logs.order(created_at: :desc)
    end

    private

    def indexed_fields(schema)
      (schema&.dig("fields") || []).index_by { |f| f["name"] }
    end

    def log_field_changes(robot, old_fields, new_fields)
      field_names = (old_fields.keys + new_fields.keys).uniq

      field_names.each do |name|
        old_field = old_fields[name]
        new_field = new_fields[name]
        next if old_field == new_field

        RobotEditLog.create!(
          robot_id: robot.id,
          user_id: current_user_id,
          field_name: name,
          old_value: old_field&.to_json,
          new_value: new_field&.to_json
        )
      end
    end

    def log_simple_change(robot, field_name, old_value, new_value)
      return if old_value == new_value

      RobotEditLog.create!(
        robot_id: robot.id,
        user_id: current_user_id,
        field_name: field_name,
        old_value: old_value,
        new_value: new_value
      )
    end

    def current_user_id
      params[:user_id]
    end
  end
end