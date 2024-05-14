-- 데이터베이스 생성
CREATE DATABASE templatedb
  LC_COLLATE 'C'
  LC_CTYPE 'C'
  ENCODING 'UTF8'
  TEMPLATE template0;

-- 유저 생성
CREATE USER template WITH 
  LOGIN 
  ENCRYPTED PASSWORD 'templatepw'
  CREATEDB;  -- 유저에게 데이터베이스 생성 권한 부여

-- 유저에게 데이터베이스 접근 권한 부여
GRANT ALL PRIVILEGES ON DATABASE templatedb TO template;

-- 유저에게 기본 스키마 접근 권한 부여
GRANT ALL PRIVILEGES ON SCHEMA public TO template;

-- 타임존 설정
ALTER DATABASE templatedb SET TIMEZONE TO 'Asia/Seoul';

-- 데이터베이스에 연결
\c templatedb