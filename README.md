# Test ASP.NET API

ASP.NET Core 8 Web API with an Arabic frontend, Entity Framework Core, and MariaDB.

## Structure

```text
Controllers/          HTTP endpoints
Contracts/Products/   Request and response DTOs
Services/Products/    Application logic
Data/                 Entity Framework DbContext
Models/               Database entities
Migrations/           Database schema history
wwwroot/               Frontend
  assets/css/          Styles
  assets/js/           Browser logic and API calls
```

## Run

Start MariaDB from XAMPP, then run:

```powershell
dotnet restore
dotnet ef database update
dotnet run
```

Open the URL printed in the terminal. Swagger is available at `/swagger` in development.
