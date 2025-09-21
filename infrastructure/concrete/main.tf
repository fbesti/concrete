resource "azurerm_resource_group" "resource_group" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_storage_account" "storage_account" {
  name                            = var.storage_account_name
  resource_group_name             = azurerm_resource_group.resource_group.name
  location                        = var.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  default_to_oauth_authentication = true
  public_network_access_enabled   = false
  network_rules {
    default_action = "Deny"
    bypass         = ["AzureServices"]
    ip_rules       = var.allowed_ip_addresses
  }
  tags = {
    environment = "mvp"
  }
}
resource "azurerm_storage_container" "documents" {
  name                  = "documents"
  storage_account_id    = azurerm_storage_account.storage_account.id
  container_access_type = "private"
}