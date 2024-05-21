to start backend
- cd backend
- docker run -d -e MYSQL_ROOT_PASSWORD=mysql -e MYSQL_DATABASE=campus_kitchen_database -p 3306:3306 mysql
- make run

to start frontend
- cd frontend
- npm i
- npm run dev
