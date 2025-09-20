resource "azurerm_resource_group" "resource_group" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "storageaccountname"
  resource_group_name      = var.storage_account_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LSR"

  tags = {
    environment = "staging"
  }
}