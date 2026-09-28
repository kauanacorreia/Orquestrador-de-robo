module Api
  class NotificationsController < ApplicationController
    def index
      notifications = Notification.order(created_at: :desc).limit(30)

      render json: notifications.map { |notification| notification_json(notification) }
    end

    private

    def notification_json(notification)
      {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        kind: notification.kind,
        execution_id: notification.execution_id,
        link_path: notification.link_path,
        created_at: notification.created_at
      }
    end
  end
end
