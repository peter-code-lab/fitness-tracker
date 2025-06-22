"use client";

// A modern fitness tracker with dark mode and improved visuals

//push testing 

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
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
    <div ref={setNodeRef} style={style}>
      <Card className="flex justify-between items-center p-4 mb-3 bg-zinc-800 text-white rounded-xl shadow-md">
        <div className="flex flex-col flex-grow cursor-grab select-none pr-4" {...attributes} {...listeners}>
          <CardContent className="text-xl font-semibold text-white">{workout.name}</CardContent>
          <div className="text-sm text-zinc-400">
            {new Date(workout.date).toLocaleString()}
          </div>
        </div>
        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={(e) => {
            e.stopPropagation();
            removeWorkout(workout.id);
          }}
        >
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
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const sensors = useSensors(useSensor(PointerSensor));

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
    <div className="min-h-screen bg-zinc-900 text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏋️ My Fitness Tracker</h1>
      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          value={newWorkout}
          onChange={(e) => setNewWorkout(e.target.value)}
          className="border border-zinc-600 bg-zinc-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Workout name"
        />
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={addWorkout}>Add Workout</Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={workouts.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          {workouts.map((workout) => (
            <SortableWorkout key={workout.id} workout={workout} removeWorkout={removeWorkout} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
