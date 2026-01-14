This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### 1. Configure Environment Variables

**IMPORTANT**: Before running the application, you must configure your API key:

1. Open the `.env.local` file in the root directory
2. Find the line `NEXT_PUBLIC_API_KEY=`
3. Add your API key after the equals sign:
   ```
   NEXT_PUBLIC_API_KEY=your-actual-api-key-here
   ```
4. Save the file

⚠️ **Without a valid API key, you will encounter "Invalid API Key" errors when working with products, categories, and other features.**

### 2. Run the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Troubleshooting

### "Invalid API Key" Error

If you see an "Invalid API Key" error:

1. Check that you have set `NEXT_PUBLIC_API_KEY` in `.env.local`
2. Verify your API key is correct
3. Restart your development server after changing environment variables
4. Contact your administrator for a valid API key if needed

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
