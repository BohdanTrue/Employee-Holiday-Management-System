import express from 'express';
import axios from 'axios';
import { refreshMiddleware } from '../middlewares/refreshMiddleware.js';

const publicHolidayRouter = express.Router();

publicHolidayRouter.get('/', refreshMiddleware, (req, res) => {
  res.render('public-holidays-form');
});

publicHolidayRouter.post('/', async (req, res) => {
  try {
    const { year, countryCode } = req.body;
    res.redirect(`/public-holidays/${year}/${countryCode}`);
  } catch (error) {
    console.error('Error processing form data:', error);
    res.status(500).send('Error processing form data');
  }
});

publicHolidayRouter.get('/:year/:countryCode', refreshMiddleware, async (req, res) => {
  try {
    const { year, countryCode } = req.params;

    const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    
    res.render('public-holidays', { publicHolidays: response.data });
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    res.status(500).send('Error fetching public holidays');
  }
});

export default publicHolidayRouter;
