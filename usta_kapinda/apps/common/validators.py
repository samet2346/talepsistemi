from django.core.exceptions import ValidationError
import os

def validate_image_size(fieldfile_obj):
    filesize = fieldfile_obj.size
    megabyte_limit = 5.0
    if filesize > megabyte_limit * 1024 * 1024:
        raise ValidationError(f"Dosya çok büyük! Maksimum {megabyte_limit}MB yükleyebilirsin.")

def validate_image_extension(value):
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Sadece resim dosyaları (.jpg, .png, .webp) yüklenebilir.')