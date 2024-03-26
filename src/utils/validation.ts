import HolidayRequest from "../models/holidayRequest";
import { HolidayResponse } from "../models/holidayResponse";
import { getPublicUkrainianHoildays } from "./workWithAPI";
import HolidayRequestService from "../services/holidayRequestService";
import EmployeeService from "../services/employeeService";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const employeeService = new EmployeeService();

let errorMessage: string | null;

export async function validateHolidayRequest(request: HolidayRequest): Promise<string | null>{ 
  errorMessage = null;
  const employee = await employeeService.getById(request.employeeId!);
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

async function hasAlreadyBookingInThisPeriod(request: HolidayRequest): Promise<boolean> {
  const holidayRequestService = new HolidayRequestService();
  const requests: HolidayRequest[] = await holidayRequestService.getArrayPendingRequestsByEmployeeId(request.employeeId!);
  requests.forEach(existingRequest => {
    if ((request.startDate! >= existingRequest.startDate! && request.startDate! <= existingRequest.endDate!) ||
    (request.endDate! >= existingRequest.startDate! && request.endDate! <= existingRequest.endDate!) ||
    (request.startDate! <= existingRequest.startDate! && request.endDate! >= existingRequest.endDate!))
    {
        return false;
      }
    });
  return true;
}

export function getTotalDaysRequested(startDate: Date, endDate: Date){
  const newEndDate = new Date(endDate);
  const newStartDate = new Date(startDate);
  return Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / MILLISECONDS_PER_DAY);
}