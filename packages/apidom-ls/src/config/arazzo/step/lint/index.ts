import allowedFieldsLint from './allowed-fields.ts';
import allowedFields11Lint from './allowed-fields-1-1.ts';
import stepIdRequiredLint from './step-id--required.ts';
import stepIdTypeLint from './step-id--type.ts';
import descriptionTypeLint from './description--type.ts';
import operationIdTypeLint from './operation-id--type.ts';
import operationPathTypeLint from './operation-path--type.ts';
import workflowIdTypeLint from './workflow-id--type.ts';
import channelPathTypeLint from './channel-path--type.ts';
import actionTypeLint from './action--type.ts';
import actionEnumLint from './action--enum.ts';
import parametersTypeLint from './parameters--type.ts';
import requestBodyTypeLint from './request-body--type.ts';
import successCriteriaTypeLint from './success-criteria--type.ts';
import onSuccessTypeLint from './on-success--type.ts';
import onFailureTypeLint from './on-failure--type.ts';
import outputsTypeLint from './outputs--type.ts';
import timeoutTypeLint from './timeout--type.ts';
import correlationIdTypeLint from './correlation-id--type.ts';

const lints = [
  allowedFieldsLint,
  allowedFields11Lint,
  stepIdRequiredLint,
  stepIdTypeLint,
  descriptionTypeLint,
  operationIdTypeLint,
  operationPathTypeLint,
  workflowIdTypeLint,
  channelPathTypeLint,
  actionTypeLint,
  actionEnumLint,
  parametersTypeLint,
  requestBodyTypeLint,
  successCriteriaTypeLint,
  onSuccessTypeLint,
  onFailureTypeLint,
  outputsTypeLint,
  timeoutTypeLint,
  correlationIdTypeLint,
];

export default lints;
