# Test Delivery API
$apiKey = "OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV"
$baseUrl = "https://onebby-api.onrender.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Delivery API Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test GET /api/admin/deliveries
Write-Host "1. Testing GET /api/admin/deliveries..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/deliveries" -Method GET -Headers @{
        "X-API-Key" = $apiKey
    } -ErrorAction Stop
    Write-Host "✓ Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Test POST /api/admin/deliveries
Write-Host "2. Testing POST /api/admin/deliveries..." -ForegroundColor Yellow
$testPayload = @{
    days_from = 2
    days_to = 5
    note = "Standard delivery test"
    option_note = "Free for orders over 50€"
    is_free_delivery = $false
    is_active = $true
    categories = @(784)
    translations = @(
        @{
            lang = "it"
            note = "Consegna standard"
            option_note = "Gratuita per ordini superiori a 50€"
        }
    )
    options = @(
        @{
            icon = ""
            details = "Standard delivery"
            price = 5.99
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/deliveries" -Method POST -Headers @{
        "X-API-Key" = $apiKey
        "Content-Type" = "application/json"
    } -Body $testPayload -ErrorAction Stop
    Write-Host "✓ Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
