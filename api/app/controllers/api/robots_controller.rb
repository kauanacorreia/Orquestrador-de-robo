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
  end
end