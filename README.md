# InventoryHub ASP.NET Core

InventoryHub is a product catalog manager built with ASP.NET Core 8 and MariaDB. Sign in to the Arabic, right-to-left dashboard to add products, update prices, search by name, and remove entries. The dashboard and REST API run in the same application, so local development needs only the .NET SDK and a database server.

## Features

- **Product management:** Create, list, view, edit, and delete products. Each product has a name and a price.
- **Arabic dashboard:** Search the catalog and see the product count, combined prices, and database connection status.
- **Administrator sign-in:** ASP.NET Core cookie authentication protects the dashboard and product endpoints.
- **Public landing page:** An animated Coming Soon page remains available without signing in. The email field is a frontend demo.
- **Database migrations and API exploration:** EF Core migrations manage the schema, and Swagger is available in development.

## Run locally

You need the **.NET 8 SDK** and a running **MariaDB** instance. On Windows with XAMPP, start the service labeled **MySQL** in the XAMPP Control Panel. Use a database account with access to the catalog and permission to apply migrations.

In PowerShell:

```powershell
git clone https://github.com/osamaalsaati/InventoryHub.AspNetCore.git
cd InventoryHub.AspNetCore

dotnet user-secrets set 'ConnectionStrings:DefaultConnection' 'Server=127.0.0.1;Port=3306;Database=inventory_hub;User=YOUR_DB_USER;Password=YOUR_DB_PASSWORD;'
dotnet user-secrets set 'AdminCredentials:Username' 'YOUR_ADMIN_USERNAME'
dotnet user-secrets set 'AdminCredentials:Password' 'YOUR_ADMIN_PASSWORD'

dotnet restore
dotnet tool install --global dotnet-ef --version 8.0.13
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet ef database update
dotnet run --launch-profile http
```

Replace the placeholders with your database and administrator credentials. The administrator account is defined by the two User Secrets values. If `dotnet-ef` is already installed, check its version with `dotnet ef --version` and use an EF Core 8 release.

| URL | What opens |
| --- | --- |
| `http://localhost:5020/` | Public Coming Soon page |
| `http://localhost:5020/login/` | Administrator sign-in |
| `http://localhost:5020/admin/` | Product dashboard |
| `http://localhost:5020/swagger` | Swagger UI in development |

## Try the API

In Postman, send a JSON request to `POST http://localhost:5020/api/auth/login` with the username and password you configured. A successful login returns a session cookie. Keep Postman's cookie jar enabled and use the same host for your product requests.

```json
{
  "username": "YOUR_ADMIN_USERNAME",
  "password": "YOUR_ADMIN_PASSWORD"
}
```

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/products` | List products |
| GET | `/api/products/{id}` | Get one product |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/auth/me` | Check the current session |
| POST | `/api/auth/logout` | Sign out |

For `POST` and `PUT` product requests, send the body as `application/json`. Use the ID returned by the create request when testing an update or deletion.

```json
{
  "name": "Mechanical Keyboard",
  "price": 49.99
}
```

Protected API endpoints return `401 Unauthorized` when the session cookie is missing or expired.

## Project layout

```text
Configuration/     Administrator configuration
Contracts/         Request and response types
Controllers/       Authentication and product endpoints
Data/              EF Core database context
Migrations/        MariaDB schema migrations
Models/            Product entity
Services/Products/ Product queries and commands
wwwroot/           Public landing page, login, dashboard, and static assets
```

The application uses ASP.NET Core 8, Entity Framework Core 8 with Pomelo, MariaDB, and plain HTML, CSS, and JavaScript.
