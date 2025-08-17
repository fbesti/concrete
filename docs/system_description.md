# House Association (HA) Management System
## Húsfélag (Hf) Management System

### 1. Identity and Authentication

#### 1.1 Login Authentication
The system supports multiple authentication methods:
- Facebook login
- Google login - [Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- IAS (Iceland Authentication Service) - [Documentation](https://docs.devland.is/products/auth)

#### 1.2 Authorization Types

##### Manager Authorization
- **Role**: System manager for each HA
- **Eligibility**: 
  - Human working as a manager of HA
  - Verified owner of HA
- **Responsibilities**: Register HA into the system

##### User Authorization
- **Role**: HA user
- **Eligibility**: Registered owners of properties that are part of the HA
- **Access**: Can view information defined in sections 2, 3, 4, and 5

#### 1.3 Registration Process

##### Manager Registration
The manager registers users using:
- **Primary**: Kennitala (Kt) - Iceland-specific identification number
- **Additional inputs** (potential):
  - Name
  - Registration ID

*Note: While the system starts with Iceland-specific inputs, it should be designed to accommodate additional input types for future expansion.*

##### Property Information Integration
During registration, the system must:
- Query property information from Iceland's Housing and Construction Authority (HMS)
- Support API integration (specific API information pending)
- Support registration of multiple HAs

### 2. System Capabilities

#### 2.1 Meeting Management
- **Digital invitations**: Send meeting invites within the app
- **Agenda management**: Create and distribute meeting agendas
- **Minutes recording**: Document meeting proceedings
- **Voting functionality**: Enable digital voting on HA matters

#### 2.2 Document Management
- Store maintenance logs
- Manage insurance documentation
- Maintain HA regulations and bylaws
- Centralized document sharing

#### 2.3 Financial Management
- **Bill payments**: Handle association fees, shared expenses, and utilities
- **Reikningar**: Track bills that the HA pays
- **Húsgjöld**: Information about housing fees
- **Framkvæmdasjóður**: Status of construction/maintenance fund (if applicable)

#### 2.4 Communication Features
- **Communication board**: Platform for HA users to interact
- **Formal requests**: Ability to create formal requests for meeting agenda items
- **Multi-channel notifications**:
  - SMS notifications
  - Email notifications
  - In-app notifications

### 3. Service Marketplace

#### 3.1 Service Provider Network
Connect residents with trusted service providers for:
- Cleaning services
- Gardening
- Snow removal
- Handyman services
- Maintenance
- Renovation projects

#### 3.2 Revenue Model
- **Commission-based**: Platform takes a percentage cut from service providers
- **Quality assurance**: Maintain network of trusted, verified providers

### 4. Fintech & Insurance

#### 4.1 Insurance Management
- **Policy tracking**: Monitor all insurance policies related to the property
- **Data aggregation**: Use collected data to analyze insurance needs
- **Optimized solutions**: Offer cheaper, optimized insurance solutions based on aggregated data

#### 4.2 Financial Integration
- **Payment solutions**: Potential integration with financing and payment platforms
- **Cost optimization**: Leverage group purchasing power for better rates

### 5. Home Security & Add-ons

#### 5.1 Security Features
- **Optional integration**: Security cameras and monitoring services
- **Scalable implementation**: Residents can opt-in to security features

#### 5.2 Future Expansion
- **Smart home compatibility**: Integration with smart home devices and systems
- **Technology roadmap**: Planned expansion into additional home automation features

---

## Technical Requirements Summary

### Authentication Requirements
- Multi-provider OAuth support (Facebook, Google, IAS)
- Role-based access control (Manager vs. User)
- Iceland-specific identification system integration

### Integration Requirements
- HMS (Housing and Construction Authority) API integration
- Multi-HA support architecture
- Notification system (SMS, Email, In-app)

### Business Model Components
1. **Core HA management** (subscription-based)
2. **Service marketplace** (commission-based)
3. **Insurance optimization** (partnership/commission-based)
4. **Security services** (premium add-on)