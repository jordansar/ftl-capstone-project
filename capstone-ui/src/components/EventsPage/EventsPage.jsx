import * as React from "react";
import "./EventsPage.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import EventCard from "./EventCard";

export default function EventsPage({ userLoginInfo, userType }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [eventSearchInput, setEventSearchInput] = useState("");
  const [searchedEvents, setSearchedEvents] = useState([]);

  function handleAddNewEvent() {
    navigate("/eventDetails");
  }

  async function getAllEvents() {
    await axios
      .post("http://localhost:3010/getAllEvents")
      .then((response) => setAllEvents(response.data));
  }

  async function getCollegeEvents() {
    await axios
      .post("http://localhost:3010/getCollegeEvents", {
        collegeName: userLoginInfo.collegeName,
      })
      .then((response) => {
        if (response.data.length == 0) {
          getAllEvents();
        } else {
          setEvents(response.data);
        }
      });
  }

  useEffect(() => {
    getCollegeEvents();
  }, [userLoginInfo]);

  function handleEventSearch(e) {
    setEventSearchInput(e.target.value);
    let filteredItems = allEvents?.filter((event) =>
      event.college.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchedEvents(filteredItems);
  }

  return (
    <>
      {userType != "college-admission-officer" && userType != "student" ? (
        <h1>
          Unfortunately, this page is for students and college admission officers only. Please log
          in <Link to={"/login"}> here. </Link>
        </h1>
      ) : (
        <div className="events-page">
          <h1>Welcome, {userLoginInfo?.firstName} to the events page!</h1>

          {userType == "college-admission-officer" ? (
            <button className="add-event-button" onClick={handleAddNewEvent}>
              Post a new Event
            </button>
          ) : null}
          {events.length != 0 ? (
            events?.map((event, i) => <EventCard key={i} event={event}></EventCard>)
          ) : (
            <>
              <input
                className="events-search"
                onChange={handleEventSearch}
                placeholder="Search for a college here"
                value={eventSearchInput}
              ></input>

              <div className="events-grid">
                {eventSearchInput != "" ? (
                  searchedEvents.length == 0 ? (
                    <h2 className="no-events">
                      No college events found. Please adjust your search.
                    </h2>
                  ) : (
                    searchedEvents.map((event) => (
                      <EventCard event={event}></EventCard>
                    ))
                  )
                ) : (
                  <>
                    <h2>
                      No events for this college have been posted yet. All
                      Events:
                    </h2>
                      {allEvents.map((event) => (
                        <EventCard event={event}></EventCard>
                      ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
