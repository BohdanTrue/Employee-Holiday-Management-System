import { HolidayResponse } from "../models/holidayResponse.js";
import { getPublicUkrainianHoildays } from "./workWithAPI.js";
import HolidayRequestService from "../services/holidayRequestService.js";
import EmployeeService from "../services/employeeService.js";
import { employeeController } from "../controllers/employee.controller.js";
import { holidayRequestController } from "../controllers/holidayRequest.controller.js";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const employeeService = new EmployeeService();

export async function validateHolidayRequest(request: any): Promise<string | null>{ 
  let errorMessage: string | null = null;
  const selectedDatabase = process.env.SELECTED_DATABASE;
  const employeeId = parseInt(request.employeeId);
  console.log(request.employeeId);
  
  console.log(employeeId);
  

  const employee: any = selectedDatabase === 'postgres'
    ? await employeeController.getById(employeeId)
    : await employeeService.getById(request.employeeId!);
  const today: Date = new Date();
  const startDate: Date = new Date(request.startDate!);
  const endDate: Date = new Date(request.endDate!);

  const publicHolidays = await getPublicUkrainianHoildays();
  const holidaysBetweenDates = await getHolidaysBetweenDates(startDate, endDate);

  if (startDate <= today || endDate <= startDate) {
    errorMessage = 'Start date cannot be earlier than today date';
    return errorMessage;
  }

  if (await hasAlreadyBookingInThisPeriod(request)) {
    errorMessage = "Employee already have holiday request in this period";
    return errorMessage;
  }

  const totalDaysRequested = getTotalDaysRequested(request.startDate!, request.endDate!);
  console.log("REMAINING HOLIDAYS " + employee.remainingHolidays!)

  if (totalDaysRequested > employee.remainingHolidays!) {
    errorMessage = 'Holiday request exceeds the maximum consecutive days allowed';
    return errorMessage;
  }

  if (publicHolidays) {
    if (holidaysBetweenDates.length > 1){
      employee!.remainingHolidays = +employee.remainingHolidays! + +holidaysBetweenDates.length;
      errorMessage = `your request falls on ${JSON.stringify(holidaysBetweenDates)} holiday,
         ${holidaysBetweenDates.length} day(s) has been added to your possible vacation days`;
         return errorMessage;
    }
  }
  errorMessage = null;
  return errorMessage;
}

async function getHolidaysBetweenDates(startDate: Date, endDate: Date): Promise<HolidayResponse[]> {
  try {
    const publicHolidays: HolidayResponse[] | undefined = await getPublicUkrainianHoildays();
    
    if (!publicHolidays) {
      throw new Error('Failed to fetch public holidays');
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    const holidaysBetweenDates: HolidayResponse[] = [];

    publicHolidays.forEach(holiday => {
      const holidayDate = new Date(holiday.date);
      if (holidayDate >= start && holidayDate <= end) {
        holidaysBetweenDates.push(holiday);
      }
    });

    return holidaysBetweenDates;
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    return [];
  }
}

async function hasAlreadyBookingInThisPeriod(request: any): Promise<boolean> {
  const holidayRequestService = new HolidayRequestService();
  const selectedDatabase = process.env.SELECTED_DATABASE;
  console.log(request.employeeId);  
  const employeeId = parseInt(request.employeeId);
  const requests: any = selectedDatabase === 'postgres'
    ? await holidayRequestController.getArrayPendingRequestsByEmployeeId(employeeId)
    : await holidayRequestService.getArrayPendingRequestsByEmployeeId(request.employeeId);

  await holidayRequestService.getArrayPendingRequestsByEmployeeId(request.employeeId);
  for (const existingRequest of requests) {
    if (selectedDatabase === 'postgre'){
      if (existingRequest.id === request.id) {
        continue;
      }
    } else {
      if (existingRequest._id === request._id){
        continue;
    }
  }
    if (
      (request.startDate <= existingRequest.endDate) &&
      (request.endDate >= existingRequest.startDate)
    ) {
      console.log('Date overlap detected.');
      return true;
    }
  }
  console.log('No overlapping dates were found.');
  return false;
}

export function getTotalDaysRequested(startDate: Date, endDate: Date){
  const newEndDate = new Date(endDate);
  const newStartDate = new Date(startDate);
  return Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / MILLISECONDS_PER_DAY);
}