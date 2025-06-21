"use client";

// A modern fitness tracker starter app using Next.js + TailwindCSS + Supabase
// Pages: Home (dashboard), Add Workout, Auth
// Features: Add/Remove/Drag Workout Cards (auth temporarily disabled for dev)

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const supabase = createClient(
  "https://rncjijazprjxtfrmnout.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuY2ppamF6cHJqeHRmcm1ub3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODYzOTIsImV4cCI6MjA2NjA2MjM5Mn0.vrJrgcUWwa8h45dw3AnAyfrEV-wSrR6Ur_DNsEWhXdk"
);

function SortableWorkout({ workout, removeWorkout }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: workout.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="flex justify-between items-center p-4 mb-2">
        <div>
          <CardContent className="text-lg font-semibold">{workout.name}</CardContent>
          <div className="text-sm text-gray-500">
            {workout.date ? new Date(workout.date).toLocaleString() : "No date provided"}
          </div>
        </div>
        <Button variant="destructive" onClick={() => removeWorkout(workout.id)}>
          Remove
        </Button>
      </Card>
    </div>
  );
}

export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState("");

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const { data } = await supabase.from("workouts").select("*").order("date", { ascending: false });
    setWorkouts(data || []);
  };

  const addWorkout = async () => {
    if (!newWorkout) return;
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("workouts").insert({ name: newWorkout, date: now }).select();
    if (error) {
      console.error("Insert error:", error);
      return;
    }
    if (!data) return;
    setWorkouts([...data, ...workouts]);
    setNewWorkout("");
  };

  const removeWorkout = async (id) => {
  console.log("Removing workout with id:", id);
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) {
    console.error("Delete error:", error);
    return;
  }
  setWorkouts((prev) => prev.filter((w) => w.id !== id));
};



  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = workouts.findIndex((w) => w.id === active.id);
      const newIndex = workouts.findIndex((w) => w.id === over?.id);
      setWorkouts((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Fitness Tracker</h1>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={newWorkout}
          onChange={(e) => setNewWorkout(e.target.value)}
          className="border p-2 rounded"
          placeholder="Workout name"
        />
        <Button onClick={addWorkout}>Add</Button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={workouts.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          {workouts.map((workout) => (
            <SortableWorkout key={workout.id} workout={workout} removeWorkout={removeWorkout} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
