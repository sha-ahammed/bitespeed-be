
## Description

Bitespeed Backend Task: Identity Reconciliation built with [Nest](https://github.com/nestjs/nest).

## Usage

```http
POST /identify HTTP/1.1
Host: bitespeed-be.onrender.com
Content-Type: application/json

{
	"email"?: string,
	"phoneNumber"?: number
}
```

## Installation

```bash
$ npm install
```

## Set Environment Variables

```
host = your.database.com
username = db_user
password = db_password
database = db_name
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


