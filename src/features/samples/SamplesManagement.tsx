import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import BackButton from "@/components/BackButton";

interface Sample {
  id: string;
  sampleId: string;
  areaName: string;
  materialType: string;
  location: string;
  description: string;
  squareFootage: string;
  percentageAsbestos?: number;
  asbestosType?: string;
  timestamp: string;
}

interface Area {
  id: string;
  name: string;
  areaNumber: number;
  assessments: Record<string, any>;
}

const ASBESTOS_TYPES = [
  "Actinolite",
  "Amosite", 
  "Anthophyllite",
  "Chrysotile",
  "Crocidolite",
  "Tremolite"
];

export const SamplesManagement: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_nextSampleId, setNextSampleId] = useState(10001); // Start with 5-digit IDs

  useEffect(() => {
    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  const fetchReportData = async () => {
    if (!reportId) return;

    try {
      setIsLoading(true);
      const response = await reportService.getReportById(reportId);

      if (response.success) {
        const answers = response.data.answers || {};
        const areaDetails = Array.isArray(answers?.areaDetails) ? answers.areaDetails : [];
        
        // Set areas
        setAreas(areaDetails);
        
        // Extract samples from areas
        const extractedSamples: Sample[] = [];
        let nextSampleNumber = 10001;

        areaDetails.forEach((area: Area) => {
          const areaMaterials = area.assessments.asbestosMaterials || [];
          
          areaMaterials.forEach((material: any) => {
            if (material.sampleCollected === 'Yes') {
              const materialName = material.isCustomMaterial ? material.customMaterialName : material.materialType;
              
              // Use existing sampleId if available, otherwise generate one
              let sampleId = material.sampleId;
              if (!sampleId) {
                sampleId = `S${nextSampleNumber.toString().padStart(5, '0')}`;
                nextSampleNumber++;
              }
              
              extractedSamples.push({
                id: material.id,
                sampleId: sampleId,
                areaName: area.name,
                materialType: materialName,
                location: material.location || '',
                description: material.description || '',
                squareFootage: material.squareFootage || '',
                percentageAsbestos: material.percentageAsbestos,
                asbestosType: material.asbestosType,
                timestamp: material.timestamp || new Date().toISOString()
              });
            }
          });
        });

        // Ensure unique sample IDs by checking for duplicates
        const usedSampleIds = new Set<string>();
        extractedSamples.forEach(sample => {
          if (usedSampleIds.has(sample.sampleId)) {
            // If duplicate found, generate a new unique ID
            let newSampleNumber = nextSampleNumber;
            while (usedSampleIds.has(`S${newSampleNumber.toString().padStart(5, '0')}`)) {
              newSampleNumber++;
            }
            sample.sampleId = `S${newSampleNumber.toString().padStart(5, '0')}`;
            nextSampleNumber = newSampleNumber + 1;
          }
          usedSampleIds.add(sample.sampleId);
        });

        setSamples(extractedSamples);
        setNextSampleId(nextSampleNumber);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSample = (sampleId: string, field: keyof Sample, value: any) => {
    setSamples(prev => prev.map(sample => 
      sample.sampleId === sampleId 
        ? { ...sample, [field]: value }
        : sample
    ));
  };

  const handleSaveResults = async () => {
    if (!reportId) return;

    try {
      setIsSaving(true);
      
      // Get the current report data first to get project_id
      const currentReport = await reportService.getReportById(reportId);
      if (!currentReport.success) {
        throw new Error('Failed to get current report data');
      }
      
      // Update the areas with the new sample data
      const updatedAreas = areas.map(area => {
        const areaMaterials = area.assessments.asbestosMaterials || [];
        const updatedMaterials = areaMaterials.map((material: any) => {
          const sample = samples.find(s => s.id === material.id);
          if (sample) {
            return {
              ...material,
              sampleId: sample.sampleId,
              percentageAsbestos: sample.percentageAsbestos,
              asbestosType: sample.asbestosType,
              timestamp: sample.timestamp
            };
          }
          return material;
        });

        return {
          ...area,
          assessments: {
            ...area.assessments,
            asbestosMaterials: updatedMaterials
          }
        };
      });

      // Save the updated report
      const payload = {
        name: currentReport.data.name || "Project Report",
        status: true,
        project_id: currentReport.data.project?.id || "",
        answers: {
          areaDetails: updatedAreas
        }
      };

      const response = await reportService.updateReport(reportId, payload);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Lab results saved successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to save results');
      }
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description: "Failed to save lab results",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    if (samples.length === 0) {
      toast({
        title: "No Data",
        description: "No samples to export",
        variant: "destructive",
      });
      return;
    }

    const csvData = samples.map(sample => ({
      'Sample ID': sample.sampleId,
      'Sample Description & Location': `${sample.description} ${sample.location}`.trim(),
      'Area': sample.squareFootage,
      'Date/Time Sampled': new Date(sample.timestamp).toLocaleString()
    }));

    const headers = ['Sample ID', 'Sample Description & Location', 'Area', 'Date/Time Sampled'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samples-${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "CSV file exported successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-4 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold">Samples Management</h1>
        </div>
        <div className="text-center py-8">Loading samples...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Samples Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={samples.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
          <Button
            onClick={handleSaveResults}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Lab Results"}
          </Button>
        </div>
      </div>

      {samples.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No samples collected yet.</p>
              <p className="text-sm text-gray-400">
                Samples will appear here once materials are marked as "Sample Collected = Yes" in the report.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Collected Samples ({samples.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sample ID</TableHead>
                    <TableHead>Area Name</TableHead>
                    <TableHead>Material Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Square Footage</TableHead>
                    <TableHead>% Asbestos</TableHead>
                    <TableHead>Asbestos Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samples.map((sample) => (
                    <TableRow key={sample.sampleId}>
                      <TableCell className="font-mono font-medium">
                        {sample.sampleId}
                      </TableCell>
                      <TableCell>{sample.areaName}</TableCell>
                      <TableCell>{sample.materialType}</TableCell>
                      <TableCell>{sample.location}</TableCell>
                      <TableCell>{sample.description}</TableCell>
                      <TableCell>{sample.squareFootage}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={sample.percentageAsbestos || ''}
                          onChange={(e) => updateSample(sample.sampleId, 'percentageAsbestos', parseFloat(e.target.value) || undefined)}
                          className="w-20"
                          placeholder="%"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={sample.asbestosType || ''}
                          onValueChange={(value) => updateSample(sample.sampleId, 'asbestosType', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASBESTOS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SamplesManagement; 