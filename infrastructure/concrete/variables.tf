variable "location" {
  description = "The Azure region where resources will be created."
  type        = string
  default     = "North Europe"
}

variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
  default     = "rg-concrete"
}

variable "storage_account_name" {
  description = "The name of the storage account."
  type        = string
  default     = "stconcrete8s9ksjs7owks"
  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.storage_account_name))
    error_message = "Storage account name must be 3-24 characters, lowercase letters and numbers only."
  }
}

variable "allowed_ip_addresses" {
  description = "List of IP addresses allowed to access the storage account"
  type        = list(string)
  default     = ["0.0.0.0"]
  validation {
    condition = alltrue([
      for ip in var.allowed_ip_addresses :
      can(cidrhost(ip, 0)) || can(regex("^\\d+\\.\\d+\\.\\d+\\.\\d+$", ip))
    ])
    error_message = "All allowed_ip_addresses must be valid IP addresses or CIDR blocks."
  }
}