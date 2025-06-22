"use client";

// A modern fitness tracker starter app using Next.js + TailwindCSS (local version without backend)
// Features: Add/Remove/Drag Workout Cards (localStorage instead of Supabase)

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
            {new Date(workout.date).toLocaleString()}
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
    const stored = localStorage.getItem("workouts");
    if (stored) {
      setWorkouts(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = () => {
    if (!newWorkout) return;
    const now = new Date().toISOString();
    const newItem = {
      id: crypto.randomUUID(),
      name: newWorkout,
      date: now,
    };
    setWorkouts([newItem, ...workouts]);
    setNewWorkout("");
  };

  const removeWorkout = (id) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = workouts.findIndex((w) => w.id === active.id);
      const newIndex = workouts.findIndex((w) => w.id === over?.id);
      const sorted = arrayMove(workouts, oldIndex, newIndex);
      setWorkouts(sorted);
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
