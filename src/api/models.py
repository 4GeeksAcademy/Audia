from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(
        String(40), unique=True, nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True
    )
    display_name: Mapped[str | None] = mapped_column(
        String(80), nullable=True
    )
    description: Mapped[str | None] = mapped_column(
        String(300), nullable=True
    )
    profile_image: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "is_active": self.is_active,
            "display_name": self.display_name,
            "description": self.description,
            "profile_image": self.profile_image,
        }

class Review(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(3000), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    album_id: Mapped[int] = mapped_column(String(), nullable=False)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="reviews")

    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "rating": self.rating,
            "album_id": self.album_id,
            "user_id": self.user_id,
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "display_name": self.user.display_name,
            },
        }