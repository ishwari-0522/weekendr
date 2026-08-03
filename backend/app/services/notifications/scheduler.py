from app.models.notification import Notification
from app.models.memory import Memory
from app.models.live_day import LiveDay
from app.database.db import db
from app.services.notifications.template_engine import TemplateEngine
from datetime import datetime, timedelta

class NotificationScheduler:
    """
    Scheduler service checking memory dates and live day progress logs to insert reminders.
    """
    @staticmethod
    def trigger_auto_reminders(user_id):
        """
        Runs check queries to insert missing reminders.
        """
        try:
            # 1. Upcoming outings: check memories scheduled for tomorrow
            tomorrow_date_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            tomorrow_memories = Memory.query.filter_by(
                user_id=user_id, 
                planned_date=tomorrow_date_str,
                is_deleted=False
            ).all()

            for m in tomorrow_memories:
                # Check duplicate
                dup = Notification.query.filter_by(
                    user_id=user_id,
                    type='upcoming_outing'
                ).all()
                has_dup = any(
                    (d.metadata_json or {}).get("memory_id") == m.id for d in dup
                )
                if not has_dup:
                    title, msg = TemplateEngine.render(
                        "upcoming_outing", 
                        template_title=m.experience_template or "WEEKENDR"
                    )
                    notif = Notification(
                        user_id=user_id,
                        type='upcoming_outing',
                        title=title,
                        message=msg,
                        action_url=f"/memories/{m.id}",
                        status='unread',
                        metadata_json={"memory_id": m.id}
                    )
                    db.session.add(notif)

            # 2. Completed outings missing reflections
            completed_memories = Memory.query.filter_by(
                user_id=user_id, 
                status='completed',
                is_deleted=False
            ).all()
            
            for cm in completed_memories:
                # If reflection is blank and no reflection_reminder yet
                if not cm.reflection:
                    dup_ref = Notification.query.filter_by(
                        user_id=user_id,
                        type='reflection_reminder'
                    ).all()
                    has_dup = any(
                        (d.metadata_json or {}).get("memory_id") == cm.id for d in dup_ref
                    )
                    if not has_dup:
                        title, msg = TemplateEngine.render("reflection_reminder")
                        notif = Notification(
                            user_id=user_id,
                            type='reflection_reminder',
                            title=title,
                            message=msg,
                            action_url=f"/memories/{cm.id}",
                            status='unread',
                            metadata_json={"memory_id": cm.id}
                        )
                        db.session.add(notif)
                        
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
