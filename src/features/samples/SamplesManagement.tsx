import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import BackButton from "@/components/BackButton";
import * as XLSX from 'xlsx';

interface Sample {
  id: string;
  sampleId: string;
  sampleNo: string;
  areaName: string;
  materialType: string;
  location?: string;
  description?: string;
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
  const [projectName, setProjectName] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

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
        const project = response.data.project || {};
        
        // Set project info
        setProjectName(project.name || "Unknown Project");
        setProjectId(project.id || "");
        
        // Set areas
        setAreas(areaDetails);
        
        // Extract samples from areas and preserve material addition order
        const extractedSamples: Sample[] = [];
        let nextSampleNumber = 10001;
        const usedSampleIds = new Set<string>();

        // Track the order in which materials were added across all areas
        const materialOrder: string[] = [];
        const materialOrderMap = new Map<string, number>();
        const materialTimestamps: { materialName: string; timestamp: string; areaName: string }[] = [];

        // First pass: collect all materials with their timestamps
        console.log('Processing areas:', areaDetails.map(a => a.name));
        
        areaDetails.forEach((area: Area) => {
          const areaMaterials = area.assessments.asbestosMaterials || [];
          console.log(`Area ${area.name} has ${areaMaterials.length} materials:`, areaMaterials.map((m: any) => ({
            materialType: m.materialType,
            customMaterialName: m.customMaterialName,
            isCustomMaterial: m.isCustomMaterial,
            sampleCollected: m.sampleCollected,
            timestamp: m.timestamp
          })));
          
          areaMaterials.forEach((material: any) => {
            if (material.sampleCollected === 'Yes') {
              const materialName = material.isCustomMaterial ? material.customMaterialName : material.materialType;
              
              // Collect material with timestamp for ordering
              if (material.timestamp) {
                materialTimestamps.push({
                  materialName,
                  timestamp: material.timestamp,
                  areaName: area.name
                });
              }
            }
          });
        });

        // Sort materials by their earliest timestamp to determine addition order
        const uniqueMaterials = new Set<string>();
        materialTimestamps.forEach(item => uniqueMaterials.add(item.materialName));
        
        // For each unique material, find its earliest timestamp
        const materialEarliestTimestamps = Array.from(uniqueMaterials).map(materialName => {
          const timestamps = materialTimestamps
            .filter(item => item.materialName === materialName)
            .map(item => new Date(item.timestamp).getTime());
          const earliestTimestamp = Math.min(...timestamps);
          return { materialName, earliestTimestamp };
        });

        // Sort by earliest timestamp to get the actual addition order
        materialEarliestTimestamps.sort((a, b) => a.earliestTimestamp - b.earliestTimestamp);
        
        // Create the material order map
        materialEarliestTimestamps.forEach((item, index) => {
          materialOrder.push(item.materialName);
          materialOrderMap.set(item.materialName, index + 1);
          console.log(`Material order by timestamp: ${item.materialName} -> ${index + 1} (earliest: ${new Date(item.earliestTimestamp).toISOString()})`);
        });
        
        console.log('Final material order:', materialOrder);
        console.log('Material order map:', Object.fromEntries(materialOrderMap));

        // Second pass: create samples with proper numbering
        areaDetails.forEach((area: Area) => {
          const areaMaterials = area.assessments.asbestosMaterials || [];
          
          areaMaterials.forEach((material: any) => {
            if (material.sampleCollected === 'Yes') {
              const materialName = material.isCustomMaterial ? material.customMaterialName : material.materialType;
              
              // Use existing sampleId if available, otherwise generate a unique one
              let sampleId = material.sampleId;
              if (!sampleId) {
                // Find the next available sample ID
                while (usedSampleIds.has(`S${nextSampleNumber.toString().padStart(5, '0')}`)) {
                  nextSampleNumber++;
                }
                sampleId = `S${nextSampleNumber.toString().padStart(5, '0')}`;
                usedSampleIds.add(sampleId);
                nextSampleNumber++;
              } else {
                // If sampleId already exists, make sure it's unique
                if (usedSampleIds.has(sampleId)) {
                  // Generate a new unique ID
                  while (usedSampleIds.has(`S${nextSampleNumber.toString().padStart(5, '0')}`)) {
                    nextSampleNumber++;
                  }
                  sampleId = `S${nextSampleNumber.toString().padStart(5, '0')}`;
                  usedSampleIds.add(sampleId);
                  nextSampleNumber++;
                } else {
                  usedSampleIds.add(sampleId);
                }
              }

              // Get the material order number (1 for first material added, 2 for second, etc.)
              const materialOrderNumber = materialOrderMap.get(materialName) || 1;
              
              // Count how many samples of this material we've seen so far
              const samplesOfThisMaterial = extractedSamples.filter(s => s.materialType === materialName).length;
              const sampleLetter = String.fromCharCode(65 + samplesOfThisMaterial); // 65 is 'A' in ASCII
              
              const sampleNo = `${materialOrderNumber}${sampleLetter}`;
              
              console.log(`Sample: ${area.name} - ${materialName} -> ${sampleNo} (order: ${materialOrderNumber}, count: ${samplesOfThisMaterial})`);
              
              extractedSamples.push({
                id: material.id,
                sampleId: sampleId,
                sampleNo: sampleNo, // Always use the calculated sample number
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

        // No need for additional processing since we've already assigned correct sample numbers
        const updatedSamples = extractedSamples;

        // Ensure unique sample IDs by checking for duplicates
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

        setSamples(updatedSamples);
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
              sampleNo: sample.sampleNo,
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
      'SampleNo': sample.sampleNo,
      'Material Type': sample.materialType,
      'Material Description': sample.description,
      // 'Sample Location': sample.location
    }));

    const headers = ['SampleNo', 'Material Type', 'Material Description'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create filename with project name and ID
    const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    const filename = `${sanitizedProjectName}-${projectId}.csv`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "CSV file exported successfully",
    });
  };

  const importLabResults = async (file: File) => {
    try {
      setIsImporting(true);
      const data = await readFileData(file);
      const results = parseLabResults(data);
      console.log("results===>", results);
      
      // Match by Sample No. from Excel with Sample No. in the management screen
      const updatedSamples = samples.map(sample => {
        const result = results.find(r => 
          r.sample?.toString().toLowerCase().trim() === sample.sampleNo?.toString().toLowerCase().trim()
        );
        console.log(`Matching sample ${sample.sampleNo} with result:`, result);
        if (result) {
          return {
            ...sample,
            percentageAsbestos: result.percentageAsbestos,
            asbestosType: result.asbestosType
          };
        }
        return sample;
      });
      setSamples(updatedSamples);
      toast({
        title: "Success",
        description: `Imported results for ${results.length} samples`,
      });
    } catch (error) {
      console.error("Error importing lab results:", error);
      toast({
        title: "Error",
        description: "Failed to import lab results. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const readFileData = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let results: any[] = [];
          
          if (file.name.endsWith('.csv')) {
            // Handle CSV file
            const text = data as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row: any = {};
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                results.push(row);
              }
            }
          } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            // Handle Excel file
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            results = XLSX.utils.sheet_to_json(worksheet);
          }
          
          resolve(results);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const parseLabResults = (data: any[]): Array<{ sample: string; percentageAsbestos?: any; asbestosType?: string; location?: string; description?: string; areaName?: string; materialType?: string }> => {
    const results: Array<{ sample: string; percentageAsbestos?: any; asbestosType?: string; location?: string; description?: string; areaName?: string; materialType?: string }> = [];
    data.forEach(row => {
      const sample = row.Sample || row.Sample || row.sample || row.sample || row['Sample'] || '';
      const content1 = row.Content_1 || row.content_1 || row['Content 1'] || row['content 1'] || '';
      const type1 = row.Type_1 || row.type_1 || row['Type 1'] || row['type 1'] || '';
      const location = row.Location || row.location || row['Location'] || row['location'] || '';
      const description = row.Description || row.description || row['Description'] || row['description'] || '';
      const areaName = row.AreaName || row.areaName || row['Area Name'] || row['area name'] || row['Area'] || row.area || '';
      const materialType = row.MaterialType || row.materialType || row['Material Type'] || row['material type'] || row['Material'] || row.material || '';
      const percentageAsbestos = content1;
   
      results.push({
        sample: sample,
        percentageAsbestos,
        asbestosType: type1 || undefined,
        location: location || undefined,
        description: description || undefined,
        areaName: areaName || undefined,
        materialType: materialType || undefined
      });
    });
    return results;
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
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,.xls,.xlsx';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  importLabResults(file);
                }
              };
              input.click();
            }}
            disabled={isImporting || samples.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : "Import Results"}
          </Button>
          <Button
            onClick={handleSaveResults}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
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
                    {/* <TableHead>Sample ID</TableHead> */}
                    <TableHead>Sample No.</TableHead>
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
                    <TableRow key={sample.id}>
                      {/* <TableCell className="font-mono font-medium">
                        <Input
                          value={sample.sampleId}
                          onChange={(e) => updateSample(sample.sampleId, 'sampleId', e.target.value)}
                          className="w-24 font-mono text-sm"
                          placeholder="sample id"
                        />
                      </TableCell> */}
                      <TableCell className="font-mono font-medium">
                        <Input
                          value={sample.areaName + "-" + sample.sampleNo}
                          onChange={(e) => updateSample(sample.sampleId, 'sampleNo', e.target.value)}
                          className="w-32 font-mono text-sm"
                          placeholder="Area-1A"
                        />
                      </TableCell>
                      <TableCell>{sample.areaName}</TableCell>
                      <TableCell>{sample.materialType}</TableCell>
                      <TableCell>{sample.location}</TableCell>
                      <TableCell>{sample.description}</TableCell>
                      <TableCell>{sample.squareFootage}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          // min="0"
                          // max="100"
                          // step="0.1"
                          value={sample.percentageAsbestos || ''}
                          onChange={(e) => updateSample(sample.sampleId, 'percentageAsbestos', e.target.value || undefined)}
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