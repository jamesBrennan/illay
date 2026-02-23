# Illay

A workout tracking app that allows you to track your workouts and see your progress.

## Primary Motivation

At the gym I want a simple interface for recording my workouts. I should do as little as possible to start a session.

## Domain Concepts

### Planning Concepts

Working out has two main concepts: Routines, which are plans for workouts, and Sessions, which are the actual workouts that follow those plans. Routines are typically used by many people, but Sessions are unique to each person. For example, "Starting Strength" is a Routine Sequence that many people use, "Starting Strength A" is one of two Routines in the Sequence. Typically, people following the Starting Strength Routine will alternate between the two Routines. On Monday they will do "Starting Strength A", on Tuesday they will rest, on Wednesday they will do "Starting Strength B", and so on.

A Session is a recording of a single workout. It has a start and end datetime. A Routine has many Sessions. A Session has many Sets. A Session does not need a name or a title. It is simply a record of the exercises and sets performed.

- Routine Sequence: A routine sequence is an ordered list of routines. For names, "Starting Strength", "Bodyweight Beginner", "Bodyweight Intermediate".
- Routine: A routine is a collection of Exercise Sequences. Example names, "Starting Strength A", "5/3/1 Day 1", "Bodyweight Day 1".
- Exercise: An exercise is description of a single exercise. Example names, "Bench Press", "Deadlift", "Squat".

### Recording Concepts

- Session: A session is a recording of a single workout. It has a start and end datetime. A Routine has many Sessions. A Session has many Sets.

- Set: A set is a single set of an exercise. It has a weight and a rep count.

## User Experience

### First Time Setup

The first time the user opens the app, they should be presented with a list of Routine Sequences. They should be able to select a Routine Sequence to start. The MVP will only include pre-defined Routine Sequences. In the future, the user should be able to create their own Routine Sequences.

Once the user has selected a Routine Sequence the app should remember the selection and use it as the default. After selecting a Routine Sequence they should see a screen with two main elements: 1) The name of the first Routine in the Sequence, and 2) A button to start a new Session.

### Starting a Session

After the user clicks the "Start Session" button they should be presented with a screen with two main elements: 1) The name of the first Exercise in the Routine, and 2) A button to start a new Set.

### Recording a Set

After the user clicks the "Start Set" button they should be presented with a screen with two main elements: 1) A text field for the weight, and 2) A text field for the rep count. The user should be able to enter the weight and rep count and click a button labeled "Completed".

After the user clicks the "Completed" button the app should be presented with a screen with two main elements: 1) The word "Rest", and 2) A countdown timer for 90 seconds. The timer should start counting down as soon as the user clicks the "Completed" button. When the timer reaches 0 the app should play an alert sound and the user should be presented with a screen with two main elements: 1) The name of the next Exercise in the Routine, and 2) A button to start a new Set.

The MVP will always use 90 seconds of rest between sets. In the future the user should be able to configure the rest time or turn off the rest timer entirely.

### Ending a Session

After the user has completed all the Exercises in the Routine they should see a screen with a summary of the Session. This summary should include the total time spent in the Session, the total weight lifted, and the total reps performed. It should also include the name and scheduled time for the next Session in the Routine Sequence.

### Returning to the App

When the user opens the app, and they have a completed Session, they should be presented with a screen with two main elements: 1) The name of the next Routine in the Sequence, and 2) A button to start a new Session.

### Viewing History

The user should be able to view their history by seeing a list of all their Sessions. The user should be able to select a Session to view the details for that Session.

