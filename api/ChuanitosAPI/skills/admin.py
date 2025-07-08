from django.contrib import admin

from .models import Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'level', 'years_of_experience', 'visibility', 'created_at')
    list_filter = ('category', 'level', 'visibility', 'created_at')
    search_fields = ('name', 'user__username', 'user__email', 'description')
    ordering = ('user', 'category', 'name')

    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'category', 'level')
        }),
        ('Details', {
            'fields': ('description', 'years_of_experience')
        }),
        ('Privacy', {
            'fields': ('visibility',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')