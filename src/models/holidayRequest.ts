import { ObjectId } from "mongodb";

export default interface HollidayRequest {
  employeeId: ObjectId,
  startDate: Date,
  endDate: Date,
  status: 'pending' | 'approved' | 'rejected',
  _id?: ObjectId,
};
