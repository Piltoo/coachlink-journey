
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "@/components/ui/material-symbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/nutrition-training")}
            className="hover:bg-gray-100"
          >
            <MaterialSymbol icon="arrow_back" />
          </Button>
          <h1 className="text-2xl font-semibold">Create Nutrition Plan Template</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter plan title"
              className="max-w-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter plan description"
              className="max-w-lg h-32"
            />
          </div>

          {/* We'll add more sections here later for meals and macros */}
          <div className="text-center text-gray-500 py-12">
            More features coming soon:
            <ul className="mt-4 space-y-2">
              <li>• Add meals and schedule</li>
              <li>• Set macro targets</li>
              <li>• Create meal templates</li>
              <li>• Add ingredients to meals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
