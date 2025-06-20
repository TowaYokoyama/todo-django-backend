# todo_backend/debug_middleware.py

import json

class DebugRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # ログインリクエストの場合のみ、中身を表示する
        if request.method == 'POST' and 'login' in request.path:
            try:
                body = json.loads(request.body)
                print("--- ログインリクエスト受信 ---")
                print(f"パス(Path): {request.path}")
                print(f"送られてきたデータ(Body): {body}")
                print("--------------------------")
            except Exception:
                # JSONでない場合も一応表示
                print("--- ログインリクエスト受信 (JSONデコードエラー) ---")
                print(f"送られてきた生データ(Body): {request.body}")
                print("------------------------------------------")

        response = self.get_response(request)
        return response