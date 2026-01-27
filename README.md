# Onebby Dashboard

A modern eCommerce dashboard built with Next.js 14, Material UI, and React. This dashboard provides comprehensive management tools for products, categories, brands, discounts, and user accounts.

## Author

Muthana - 2026 All rights reserved.

## Features

- Product Management: Create, edit, and manage products with images, pricing, and inventory
- Category Management: Organize products with parent/child category structure
- Brand Management: Handle brand information and associations
- Discount System: Create and manage promotional campaigns
- Tax Management: Configure tax classes and rates
- User Authentication: Secure login system with role-based access
- Responsive Design: Mobile-friendly interface
- Dark/Light Mode: Theme switching support
- Multi-language Ready: Internationalization support

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Material UI (MUI)
- React Hook Form
- TanStack Table
- Cloudinary (Image Management)
- Prisma (Database ORM)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- API access credentials

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/onebby-dashboard.git
cd onebby-dashboard
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_API_KEY`: Your API key for backend services
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # Reusable components
├── views/           # Page views and features
├── configs/         # Configuration files
├── libs/            # Third-party library configurations
├── utils/           # Utility functions
├── @core/           # Core theme components
├── @layouts/        # Layout components
└── @menu/           # Navigation menu components
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
```

Never commit `.env.local` to version control.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This application can be deployed to:

- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

Make sure to configure environment variables in your hosting platform.

## Security Notes

- All API keys and credentials are stored in environment variables
- Sensitive files are excluded via .gitignore
- Authentication tokens are stored securely in localStorage
- API requests include authentication headers

## License

Copyright 2026 Muthana. All rights reserved.
Unauthorized copying or distribution is prohibited.

## Support

For support or questions, please contact the development team.
