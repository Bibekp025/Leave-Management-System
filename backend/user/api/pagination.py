from rest_framework.pagination import PageNumberPagination

class ListPagination(PageNumberPagination):
    page_size=1
    page_query_param='p'
    max_page_size=100