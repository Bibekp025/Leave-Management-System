from rest_framework.throttling import UserRateThrottle

class UpdateThrottle(UserRateThrottle):
    scope='update'
    rate='10/min'