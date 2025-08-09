# YourJob Platform

A comprehensive job platform built with modern technologies including Kotlin/Spring Boot backend, React/TypeScript frontend, and extensive features for job seekers and employers.

## 🚀 Features

### Core Features
- **User Management**: Secure authentication with JWT, user profiles, role-based access
- **Job Posting & Management**: Complete CRUD operations for job postings with advanced filtering
- **Resume Builder**: Sectioned resume creation with file attachments and templates
- **Application System**: Job applications with status tracking and employer management
- **Payment Integration**: Premium features with Toss Payments integration
- **Search & Filtering**: Advanced job search with 20+ filter criteria
- **Admin Dashboard**: Comprehensive analytics, monitoring, and management tools

### Advanced Features
- **Web Crawler**: Automated job posting collection from external sites (Saramin, JobKorea, Wanted)
- **Real-time Analytics**: System health monitoring, user behavior tracking
- **Monitoring Stack**: Prometheus + Grafana + ELK stack integration
- **API Rate Limiting**: Intelligent request throttling and abuse protection
- **File Management**: AWS S3 integration for file storage
- **Email Notifications**: SMTP integration for automated communications

## 🛠 Technology Stack

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot 3.3.6
- **Database**: MySQL 8.0 with MyBatis
- **Cache**: Redis 7
- **Authentication**: JWT + Session hybrid
- **File Storage**: AWS S3
- **Payment**: Toss Payments API
- **Monitoring**: Micrometer + Actuator

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Bundler**: Webpack
- **Styling**: CSS3 + Custom components
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **Development**: Multi-stage builds with dev/prod environments

## 📦 Project Structure

```
yourjob_repo/
├── backend/                 # Kotlin/Spring Boot API
│   ├── src/main/kotlin/
│   │   └── com/yourjob/backend/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── entity/      # Data models
│   │       ├── mapper/      # MyBatis mappers
│   │       └── util/        # Utilities
│   └── Dockerfile
├── bff/                     # Backend for Frontend
│   ├── src/main/kotlin/
│   └── Dockerfile
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API clients
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── docker/                  # Docker configurations
│   ├── mysql/initdb.d/     # Database schema & data
│   ├── nginx/              # Nginx configurations
│   ├── prometheus/         # Monitoring config
│   └── grafana/            # Dashboard config
├── docker-compose.yml       # Multi-service deployment
├── .env.example            # Environment variables template
├── deploy.sh               # Production deployment script
└── dev.sh                  # Development helper script
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Production Deployment
```bash
# Clone the repository
git clone <repository-url>
cd yourjob_repo

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Deploy the platform
./deploy.sh deploy production

# Check service health
./deploy.sh health
```

### Development Setup
```bash
# Start development environment
./dev.sh start

# Run backend locally
./dev.sh backend run

# Run frontend locally
./dev.sh frontend install
./dev.sh frontend run
```

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```bash
# Database
DB_HOST=db
DB_NAME=yourjobdb
DB_USER=urjob
DB_PASSWORD=your-secure-password

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRATION=86400000

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# Payment Gateway
TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key

# Monitoring
GRAFANA_PASSWORD=your-grafana-password
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts (job seekers, employers, admins)
- **company_profiles**: Company information and branding
- **job_postings**: Job advertisements with metadata
- **job_applications**: Application tracking system
- **resumes**: Resume data with sectioned content
- **payments**: Payment transactions and premium features

### Advanced Tables
- **crawler_jobs**: Web scraping job queue and results
- **premium_products**: Product catalog for premium features
- **activity_logs**: System activity and audit trail
- **admin_alerts**: Administrative notifications
- **user_sessions**: Session management and tracking

## 🔐 Security Features

- **Authentication**: JWT + Session hybrid authentication
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: Bcrypt hashing with salt
- **Rate Limiting**: API endpoint protection
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Comprehensive data validation
- **File Upload**: Secure file handling with type validation
- **SQL Injection**: MyBatis parameter binding protection

## 📈 Monitoring & Analytics

### Available Dashboards
- **System Health**: CPU, memory, disk usage
- **Application Metrics**: Response times, error rates
- **Business Metrics**: User registrations, job applications, payments
- **Security Monitoring**: Failed logins, suspicious activity

### Endpoints
- **Health Check**: `/actuator/health`
- **Metrics**: `/actuator/prometheus`
- **Admin Dashboard**: `/admin`
- **Grafana**: `http://localhost:3001`
- **Kibana**: `http://localhost:5601`

## 🔄 Crawler System

### Supported Sites
- **Saramin**: Job posting aggregation
- **JobKorea**: Career opportunity collection
- **Wanted**: Tech job specialization

### Features
- **Duplicate Detection**: Prevents data duplication
- **Rate Limiting**: Respectful scraping practices
- **Error Handling**: Robust retry mechanisms
- **Data Integration**: Automatic job posting creation

## 💳 Payment Integration

### Toss Payments
- **Premium Job Postings**: Enhanced visibility
- **Featured Listings**: Priority placement
- **Urgent Tagging**: Expedited processing
- **Banner Advertising**: Promotional opportunities

### Product Catalog
- Basic Exposure (무료)
- Premium Exposure (₩50,000)
- Urgent Posting (₩30,000)
- Featured Badge (₩20,000)
- Top Listing (₩100,000)
- Highlight Color (₩15,000)
- Banner Advertisement (₩200,000)

## 🛠 Development

### Backend Development
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Management
```bash
# Reset database
./dev.sh db:reset

# View database logs
./dev.sh logs db
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/refresh` - Token refresh

### Job Management
- `GET /api/jobs` - List jobs with filtering
- `POST /api/jobs` - Create job posting
- `PUT /api/jobs/{id}` - Update job posting
- `DELETE /api/jobs/{id}` - Delete job posting

### Application Management
- `POST /api/applications` - Submit application
- `GET /api/applications` - List applications
- `PUT /api/applications/{id}` - Update application status

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - User management
- `GET /api/admin/statistics` - Platform statistics

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check database health
./deploy.sh health

# Reset database
./dev.sh db:reset
```

2. **Memory Issues**
```bash
# Check container resources
docker stats

# Increase JVM memory in docker-compose.yml
JAVA_OPTS: "-Xmx2g"
```

3. **File Upload Problems**
```bash
# Check S3 configuration
aws s3 ls s3://your-bucket-name

# Verify environment variables
cat .env | grep AWS
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**YourJob Platform** - Connecting talent with opportunity 🚀
