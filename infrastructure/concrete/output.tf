output "resource_group_name" {
  description = "The name of the created resource group."
  value       = azurerm_resource_group.resource_group.name
}

output "storage_account_name" {
  description = "The name of the created storage account."
  value       = azurerm_storage_account.storage_account.name
}