from ..models import Leave

def get_available_leaves(user, total_days=48):
    approved_count = Leave.objects.filter(user=user, status='approved').count()
    return int(total_days * 0.2) - approved_count
