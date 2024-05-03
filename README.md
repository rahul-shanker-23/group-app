<h1>Group Chat App API Documentation</h1>

The Group Chat App API provides developers with the tools to integrate group messaging functionality into their applications. 
This documentation outlines the Features, How to run, How to test and execute API.

## Features
- Admin
  - can login
  - can create a user
  - can update a user
  - can logout
- User
  - can login
  - can logout
  - can see all users
  - can see a particular user
- Group
  - user can create a group
  - group owner can add other user to the group
  - group owner can delete group
  - user can see all groups
  - user can see a particular group
- Message
  - group user can send message
  - group user can see all message
  - group user can like message
  - group user can unlike message

## How to run
- Clone the repo
- Run below command
<pre>npm install</pre>
- Add .env file in the same directory
- Add below mentioned env variable in .env file
<pre>
  DATABASE = mongodb-url
  DATABASE_TEST = mongodb-test-url
  DATABASE_TEST_PASSWORD = mongodb-test-password
  DATABASE_PASSWORD = mongodb-password
  JWT_SECRET = your-secret-string
  JWT_EXPIRES_IN = 1d
  JWT_COOKIE_EXPIRES_IN = 1
</pre>

## How to run test
After adding test db in .env file run below command
<pre>npm run test</pre>
 
## API Endpoints
<pre>
- Admin/User
  - POST     /api/v1/users/signup
  - PUT      /api/v1/users/update
  - POST     /api/v1/users/login
  - POST     /api/v1/users/logout
  - GET      /api/v1/users
  - GET      /api/v1/users/:id
- Group
  - POST     /api/v1/groups
  - GET      /api/v1/groups
  - GET      /api/v1/groups/:id
  - DELETE   /api/v1/groups/:id
  - POST     /api/v1/groups/add
- Message
  - GET      /api/v1/messages
  - POST     /api/v1/messages
  - POST     /api/v1/messages/like
  - POST     /api/v1/messages/unlike
</pre>
  
