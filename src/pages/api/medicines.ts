// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import mongoose from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = any

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  // CONNECTING TO MONGOOSE (Get Database Url from .env.local)
  const { MONGO_URL } = process.env

  // connection function
  const conn = await mongoose
    .connect(MONGO_URL as string)
    .catch(err => console.log(err))

  const collection = conn?.connection.db.collection('scraper_new')

  const { offset, ...filters } = req.query;
  const query = Object.entries(filters).filter(k => !k[0].includes("__") && k[1] !== "").map(([key, value]) => {
    const exact = filters[`exact__${key}`];
    const starts = filters[`starts__${key}`];
    const ends = filters[`ends__${key}`];
    if (exact) return { [key]: value };
    if (starts) return { [key]: new RegExp(`^${value}`, "i") };
    if (ends) return { [key]: new RegExp(`${value}$`, "i") };
    return { [key]: new RegExp(value as string, "i") };
  }).reduce((acc, cur) => ({ ...acc, ...cur } as any), {});

  const medicines = await collection?.find(query).skip(parseInt(offset as string)).limit(50).toArray()
  const count = await collection?.countDocuments(query) || 0;

  res.status(200).json({
    results: medicines,
    count,
    offset,
    has_next: count > parseInt(offset as string) + 50
  })
}
