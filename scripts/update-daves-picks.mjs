import fs from 'fs';
import path from 'path';

const RELEASES_PATH = path.join(process.cwd(), 'data', 'releases.json');
const rawData = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));

const davesPicksList = [
  { vol: 1, date: "1977-05-25", venue: "The Mosque, Richmond, VA" },
  { vol: 2, date: "1974-07-31", venue: "Dillon Stadium, Hartford, CT" },
  { vol: 3, date: "1971-10-22", venue: "Auditorium Theatre, Chicago, IL" },
  { vol: 4, date: "1976-09-24", venue: "College of William & Mary, Williamsburg, VA" },
  { vol: 5, date: "1973-11-17", venue: "Pauley Pavilion (UCLA), Los Angeles, CA" },
  { vol: 6, dates: ["1969-12-20", "1970-02-02"], venue: "Fillmore South / Fox Theatre, SF, CA / St. Louis, MO" },
  { vol: 7, date: "1978-04-24", venue: "Horton Field House (ISU), Normal, IL" },
  { vol: 8, date: "1980-11-30", venue: "Fox Theatre, Atlanta, GA" },
  { vol: 9, date: "1974-05-14", venue: "Harry Adams Field House, Missoula, MT" },
  { vol: 10, date: "1969-12-12", venue: "Thelma Theater, Los Angeles, CA" },
  { vol: 11, date: "1972-11-17", venue: "Century II Convention Hall, Wichita, KS" },
  { vol: 12, date: "1977-11-04", venue: "Colgate University, Hamilton, NY" },
  { vol: 13, date: "1974-02-24", venue: "Winterland Arena, San Francisco, CA" },
  { vol: 14, date: "1972-03-26", venue: "Academy of Music, New York, NY" },
  { vol: 15, date: "1978-04-22", venue: "Municipal Auditorium, Nashville, TN" },
  { vol: 16, date: "1973-03-28", venue: "Springfield Civic Center, Springfield, MA" },
  { vol: 17, date: "1974-07-19", venue: "Selland Arena, Fresno, CA" },
  { vol: 18, date: "1976-07-17", venue: "Orpheum Theatre, San Francisco, CA" },
  { vol: 19, date: "1970-01-23", venue: "Honolulu Civic Auditorium, Honolulu, HI" },
  { vol: 20, date: "1981-12-09", venue: "CU Events Center, Boulder, CO" },
  { vol: 21, date: "1973-04-02", venue: "Boston Garden, Boston, MA" },
  { vol: 22, date: "1971-12-07", venue: "Felt Forum, New York, NY" },
  { vol: 23, date: "1978-01-22", venue: "McArthur Court (U of O), Eugene, OR" },
  { vol: 24, date: "1972-08-25", venue: "Berkeley Community Theatre, Berkeley, CA" },
  { vol: 25, date: "1977-11-06", venue: "Broome County Arena, Binghamton, NY" },
  { vol: 26, date: "1971-11-17", venue: "Albuquerque Civic Aud., Albuquerque, NM" },
  { vol: 27, date: "1983-09-02", venue: "Boise State University, Boise, ID" },
  { vol: 28, date: "1976-06-17", venue: "Capitol Theatre, Passaic, NJ" },
  { vol: 29, date: "1977-02-26", venue: "Swing Auditorium, San Bernardino, CA" },
  { vol: 30, date: "1970-01-02", venue: "Fillmore East, New York, NY" },
  { vol: 31, date: "1979-12-03", venue: "Uptown Theatre, Chicago, IL" },
  { vol: 32, date: "1973-03-24", venue: "The Spectrum, Philadelphia, PA" },
  { vol: 33, date: "1977-10-29", venue: "Northern Illinois Univ., DeKalb, IL" },
  { vol: 34, date: "1974-06-23", venue: "Jai-Alai Fronton, Miami, FL" },
  { vol: 35, date: "1984-04-20", venue: "Philadelphia Civic Center, Philadelphia, PA" },
  { vol: 36, dates: ["1987-03-26", "1987-03-27"], venue: "Hartford Civic Center, Hartford, CT" },
  { vol: 37, date: "1978-04-15", venue: "College of William & Mary, Williamsburg, VA" },
  { vol: 38, date: "1973-09-08", venue: "Nassau Coliseum, Uniondale, NY" },
  { vol: 39, date: "1983-04-26", venue: "The Spectrum, Philadelphia, PA" },
  { vol: 40, dates: ["1990-07-18", "1990-07-19"], venue: "Deer Creek Music Center, Noblesville, IN" },
  { vol: 41, date: "1977-05-26", venue: "Baltimore Civic Center, Baltimore, MD" },
  { vol: 42, date: "1974-02-23", venue: "Winterland Arena, San Francisco, CA" },
  { vol: 43, dates: ["1969-11-02", "1969-12-26"], venue: "Family Dog / McFarlin Aud., SF, CA / Dallas, TX" },
  { vol: 44, date: "1990-06-23", venue: "Autzen Stadium, Eugene, OR" },
  { vol: 45, dates: ["1977-10-01", "1977-10-02"], venue: "Paramount Theatre, Portland, OR" },
  { vol: 46, date: "1972-09-09", venue: "Hollywood Palladium, Hollywood, CA" },
  { vol: 47, date: "1979-12-09", venue: "Kiel Auditorium, St. Louis, MO" },
  { vol: 48, date: "1971-11-20", venue: "Pauley Pavilion (UCLA), Los Angeles, CA" },
  { vol: 49, dates: ["1985-04-27", "1985-04-28"], venue: "Frost Amphitheatre, Stanford, CA" },
  { vol: 50, date: "1977-05-03", venue: "Palladium, New York, NY" },
  { vol: 51, date: "1971-04-13", venue: "Scranton Catholic Youth Ctr, Scranton, PA" },
  { vol: 52, date: "1983-09-11", venue: "The Downs at Santa Fe, Santa Fe, NM" },
  { vol: 53, date: "1976-10-02", venue: "Riverfront Coliseum, Cincinnati, OH" },
  { vol: 54, date: "1973-03-26", venue: "Baltimore Civic Center, Baltimore, MD" },
  { vol: 55, date: "1978-10-21", venue: "Winterland Arena, San Francisco, CA" },
  { vol: 56, dates: ["1981-03-20", "1981-03-21"], venue: "Rainbow Theatre, London, England" },
  { vol: 57, date: "1978-02-01", venue: "Uptown Theatre, Chicago, IL" },
];

const bonusDiscs = [
  { year: 2012, date: "1977-05-25", venue: "The Mosque, Richmond, VA" },
  { year: 2013, date: "1973-11-01", venue: "Northwestern University, Evanston, IL" },
  { year: 2014, date: "1974-05-12", venue: "Univ. of Montana, Missoula, MT" },
  { year: 2015, date: "1973-03-27", venue: "Springfield Civic Center, Springfield, MA" },
  { year: 2016, date: "1976-07-16", venue: "Orpheum Theatre, San Francisco, CA" },
  { year: 2017, dates: ["1974-07-16", "1974-07-21"], venue: "Des Moines, IA / Hollywood, CA" },
  { year: 2018, date: "1976-06-16", venue: "Capitol Theatre, Passaic, NJ" },
  { year: 2019, date: "1977-02-26", venue: "Swing Auditorium, San Bernardino, CA" },
  { year: 2020, date: "1981-12-08", venue: "CU Events Center, Boulder, CO" },
  { year: 2021, date: "1973-04-01", venue: "Boston Garden, Boston, MA" },
  { year: 2022, date: "1971-12-06", venue: "Felt Forum, New York, NY" },
  { year: 2023, date: "1978-01-23", venue: "McArthur Court, Eugene, OR" },
  { year: 2024, date: "1977-05-04", venue: "The Palladium, New York, NY" },
];

// 1. Remove all current Dave's Picks to avoid duplicates and inconsistencies
const filteredData = rawData.filter(entry => !entry.title.includes("Dave's Picks"));

// 2. Add standardized entries
const newEntries = [];

davesPicksList.forEach(dp => {
  newEntries.push({
    type: dp.dates ? "exact" : "exact",
    dates: dp.dates || [dp.date],
    title: `Dave's Picks Volume ${dp.vol}: ${dp.venue}`,
    discUrl: `https://www.deaddisc.com/disc/Daves_Picks_${dp.vol}.htm`,
    volume: dp.vol
  });
});

bonusDiscs.forEach(bd => {
  newEntries.push({
    type: bd.dates ? "exact" : "exact",
    dates: bd.dates || [bd.date],
    title: `Dave's Picks Bonus CD ${bd.year}: ${bd.venue}`,
    discUrl: `https://www.deaddisc.com/disc/Daves_Picks_Bonus_${bd.year}.htm`
  });
});

const updatedData = [...filteredData, ...newEntries];

// Sort updatedData by date primarily (not strictly necessary but nice)
// Actually we'll keep the order as is for now

fs.writeFileSync(RELEASES_PATH, JSON.stringify(updatedData, null, 2));
console.log(`Updated Dave's Picks. Total releases: ${updatedData.length}`);
