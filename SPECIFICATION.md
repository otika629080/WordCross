# cloudflare特化超高速分散コンピューティングCMS

HonoX + Cloudflare WorkersでSqlite(D1)に特化したCMSを作ります。
- WordPressを完全に代替する製品です。
- DBはSqlite(D1)にのみ対応させます。
- これらの技術スタックの強みを最大限活かして圧倒的に高速なCMSを作ります。

MVP段階ではGoogle Siteと同程度のノーコードサイトビルダーで十分です。
- ticketsフォルダ配下にチケットを切ってMVP完成までの開発を計画して下さい。

ドキュメント
- **Hono Framework**: https://hono.dev/llms-full.txt
- **HonoX Meta-framework**: https://github.com/honojs/honox
- **Cloudflare Workers**: https://developers.cloudflare.com/llms-full.txt

コーディング規約
- any型の使用を禁止する
- スタイリングはtailwindCSSのみを使い、通常のcssは使わない。


Admin user details:
Email: admin@wordcross.local
Password: admin123
Password Hash: $2b$12$sq3pKjj4Fo1yHqCtLXxgwOe7C79wREidO.VxJRH6Exj69N1g39rHy
Name: Admin User

SQL to run:
INSERT INTO admin_users (email, password_hash, name, is_active) VALUES ('admin@wordcross.local', '$2b$12$sq3pKjj4Fo1yHqCtLXxgwOe7C79wREidO.VxJRH6Exj69N1g39rHy', 'Admin User', TRUE);