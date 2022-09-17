import express from "express";
import cors from 'cors'
import { prisma } from "./prisma";
import { convertHourStringToNunber } from "./utils/convert-hour-string-to-number";
import { convertMinutesToHourString } from "./utils/convert-minutes-number-to-string";




const app = express()
app.use(cors())

app.use(express.json())

app.get("/games", async (request, response) =>{

    const games = await prisma.game.findMany({
      include:{
        _count:{
          select:{
            ads: true
          }
        }
      }
    })


  return response.status(200).json(games)
})

app.post("/games/:id/ads", async (request, response) =>{

  const gameId = request.params.id

  const {name, yearsPalying, discord, weekDays, hourStart, hourEnd, useVoiceChannel} = request.body

  const ad = await prisma.ad.create({
    data:{
      gameId,
      name, 
      yearsPalying, 
      discord, 
      weekDays: weekDays.join(','), 
      hourStart: convertHourStringToNunber(hourStart),
      hourEnd: convertHourStringToNunber(hourEnd), 
      useVoiceChannel
    }
  })


  return response.status(201).json(ad)
})

app.get("/games/:id/ads", async(request, response) =>{

  const gameId= request.params.id

  const ads = await prisma.ad.findMany({
    select:{
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPalying: true,
      hourStart: true,
      hourEnd: true,
      createdAt: true,
    },
    where: {
      gameId: gameId
    },
    orderBy:{
      createdAt: 'desc',
    }
  })

  return response.json(ads.map(ad =>{
    return{
      ...ad,
      weekDays: ad.weekDays.split(","),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd),  
    }
  }))
})

app.get("/ads/:id/discord", async (request, response) =>{

  const adId = request.params.id

  const ad = await prisma.ad.findUniqueOrThrow({

    select:{
      discord: true
    },

    where:{
      id: adId
    }
  })


  return response.status(200).json({
    discord: ad.discord
  })
})






app.listen(3333, () =>{
  console.log("server on port 3333")
})