// src/boxes/boxes.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { Box } from 'src/models/box.scheme';

@Injectable()
export class BoxService {
  constructor(@InjectModel(Box.name) private boxModel: Model<Box>) {}

  async create(box: CreateBoxDto, userId: string): Promise<Box> {
    const existingBox = await this.boxModel.findOne({
      reviewInterval: box.reviewInterval,
    });

    if (existingBox) {
      throw new HttpException(
        'Box with the same review interval already exists',
        HttpStatus.CONFLICT,
      );
    }

    box.userId = userId;
    const createdBox = new this.boxModel(box);
    return createdBox.save();
  }

  async update(id: string, box: UpdateBoxDto, userId: string): Promise<Box> {
    const existingBox = await this.boxModel.findOne({ _id: id, userId });

    if (!existingBox) {
      throw new NotFoundException(`Box not found`);
    }

    if (existingBox.reviewInterval !== box.reviewInterval) {
      const isThereSameBox = await this.boxModel.findOne({
        _id: { $ne: id },
        userId,
        reviewInterval: box.reviewInterval,
      });

      if (isThereSameBox)
        throw new HttpException(
          'Box with the same review interval already exists',
          HttpStatus.CONFLICT,
        );

      existingBox.reviewInterval = box.reviewInterval;
      await existingBox.save();
    }

    return existingBox;
  }

  async findAll(userId: string): Promise<Box[]> {
    const userObjectId = new Types.ObjectId(userId);

    const boxes = await this.boxModel
      .aggregate([
        { $match: { userId: userObjectId } },
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: 'boxId',
            as: 'cards',
          },
        },
        {
          $addFields: {
            cardCount: { $size: '$cards' },
          },
        },
        {
          $project: {
            cards: 0,
          },
        },
        { $sort: { reviewInterval: 1 } },
      ])
      .exec();

    return boxes;
  }

  async findOne(id: string, userId: string): Promise<Box> {
    const userObjectId = new Types.ObjectId(userId);
    const boxObjectId = new Types.ObjectId(id);

    const box = await this.boxModel
      .aggregate([
        {
          $match: { _id: boxObjectId, userId: userObjectId },
        },
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: 'boxId',
            as: 'cards',
          },
        },
        {
          $limit: 1,
        },
      ])
      .exec();

    if (!box) {
      throw new HttpException('Box is not found', HttpStatus.NOT_FOUND);
    }
    return box[0];
  }

  async remove(id: string, userId: string): Promise<Box> {
    const box = await this.boxModel.findOne({ _id: id, userId }).exec();

    if (!box) {
      throw new NotFoundException('Box not found');
    }

    return await this.boxModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}