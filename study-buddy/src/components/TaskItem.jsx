import React from 'react';

// Accept onToggleComplete and onDelete props
function TaskItem({ task, onToggleComplete, onDelete }) {
  return (
    <li className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
      <span className={`flex-1 break-words mr-4 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {task.text}
      </span>
      <div className="flex space-x-2 ml-auto flex-shrink-0">
         <button
           onClick={onToggleComplete} // Call handler on click
           aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
           className={`p-1 rounded ${task.completed ? 'text-gray-400 hover:text-gray-600' : 'text-emerald-500 hover:text-emerald-700'}`} // Secondary color for completion
         >
           {/* Check icon placeholder - could use an SVG library later */}
           {task.completed ? '↩️' : '✔️'}
         </button>
         <button
            onClick={onDelete} // Call handler on click
            aria-label="Delete task"
            className="p-1 rounded text-red-500 hover:text-red-700"
          >
            {/* Trash icon placeholder */}
            🗑️
          </button>
      </div>
    </li>
  );
}

export default TaskItem;
